<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * Áudio da Sofia: o arquivo vira texto e a resposta sai da mesma base das
 * outras perguntas. Sem chave de transcrição, a tela recebe o aviso — nada
 * é enviado para fora.
 */
class SofiaAudioTest extends TestCase
{
    use RefreshDatabase;

    private const AVISO_SEM_CHAVE = 'A transcrição de arquivos de áudio não está configurada. Defina OPENAI_API_KEY no ambiente para enviar áudios gravados ou anexados.';

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
        config()->set('hc.sofia.transcricao.chave', null);
    }

    private function autenticado(): static
    {
        return $this->actingAs(User::firstOrFail());
    }

    private function audio(): UploadedFile
    {
        return UploadedFile::fake()->create('pergunta.webm', 16, 'audio/webm');
    }

    private function enviar(UploadedFile $arquivo): TestResponse
    {
        return $this->autenticado()->post('/api/sofia/audio', [
            'audio' => $arquivo,
        ], [
            'Accept' => 'application/json',
        ]);
    }

    public function test_audio_exige_sessao(): void
    {
        $this->postJson('/api/sofia/audio')->assertUnauthorized();
    }

    public function test_audio_exige_um_arquivo(): void
    {
        $this->autenticado()
            ->postJson('/api/sofia/audio')
            ->assertUnprocessable()
            ->assertJsonPath('errors.audio.0', 'Escolha ou grave um áudio para enviar.');
    }

    public function test_audio_recusa_arquivo_que_nao_e_som(): void
    {
        $this->enviar(UploadedFile::fake()->create('notas.txt', 4, 'text/plain'))
            ->assertUnprocessable()
            ->assertJsonPath('errors.audio.0', 'Envie um áudio em webm, mp3, m4a, wav ou ogg.');
    }

    public function test_audio_avisa_quando_a_transcricao_nao_esta_configurada(): void
    {
        Http::preventStrayRequests();

        $this->enviar($this->audio())
            ->assertStatus(503)
            ->assertJsonPath('message', self::AVISO_SEM_CHAVE);

        Http::assertNothingSent();
    }

    public function test_audio_responde_com_a_transcricao_e_a_base(): void
    {
        config()->set('hc.sofia.transcricao.chave', 'chave-de-teste');
        Http::preventStrayRequests();
        Http::fake([
            'https://api.openai.com/v1/audio/transcriptions' => Http::response([
                'text' => 'Quais empresas temos?',
            ]),
        ]);

        $this->enviar($this->audio())
            ->assertOk()
            ->assertJsonPath('transcricao', 'Quais empresas temos?')
            ->assertJsonPath('resposta', fn (string $resposta) => str_starts_with($resposta, 'Temos 5 empresas'));

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://api.openai.com/v1/audio/transcriptions'
                && $request->hasHeader('Authorization', 'Bearer chave-de-teste');
        });
    }

    public function test_audio_avisa_quando_a_transcricao_falha(): void
    {
        config()->set('hc.sofia.transcricao.chave', 'chave-de-teste');
        Http::preventStrayRequests();
        Http::fake([
            'https://api.openai.com/v1/audio/transcriptions' => Http::response(['error' => 'falhou'], 500),
        ]);

        $this->enviar($this->audio())
            ->assertStatus(502)
            ->assertJsonPath('message', 'Não consegui transcrever o áudio agora. Tente novamente em instantes.');
    }

    public function test_audio_avisa_quando_nao_ha_fala(): void
    {
        config()->set('hc.sofia.transcricao.chave', 'chave-de-teste');
        Http::preventStrayRequests();
        Http::fake([
            'https://api.openai.com/v1/audio/transcriptions' => Http::response(['text' => '   ']),
        ]);

        $this->enviar($this->audio())
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Não consegui entender o áudio. Grave de novo ou escreva a pergunta.');
    }
}
