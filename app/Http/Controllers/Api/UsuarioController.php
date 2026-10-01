<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AtualizarUsuarioRequest;
use App\Http\Requests\CadastrarUsuarioRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class UsuarioController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UsuarioResource::collection(User::orderBy('id')->get());
    }

    /**
     * O cadastro feito na tela de Usuários entra no banco, então o contador do
     * menu lateral muda para todo mundo — não só para a aba que cadastrou.
     */
    public function store(CadastrarUsuarioRequest $request): JsonResponse
    {
        $dados = $request->validated();

        $usuario = User::create([
            'name' => $dados['nome'],
            'email' => $dados['email'],
            'password' => $dados['senha'],
            'perfil' => $dados['perfil'],
            'area' => $dados['area'],
            'status' => $dados['status'],
        ]);

        return (new UsuarioResource($usuario))->response()->setStatusCode(201);
    }

    public function update(AtualizarUsuarioRequest $request, User $usuario): UsuarioResource
    {
        $dados = $request->validated();

        $this->recusarSeUltimoAdministrador(
            $usuario,
            $dados['perfil'] !== 'Administrador' || $dados['status'] !== 'Ativo',
            'Esta é a única pessoa com perfil de Administrador ativo: promova outra antes de mudar este acesso.'
        );

        // Senha em branco significa "não mexer", não "apagar a senha".
        $senha = $dados['senha'] ?? '';

        $usuario->update([
            'name' => $dados['nome'],
            'email' => $dados['email'],
            'perfil' => $dados['perfil'],
            'area' => $dados['area'],
            'status' => $dados['status'],
            ...($senha !== '' ? ['password' => $senha] : []),
        ]);

        return new UsuarioResource($usuario);
    }

    public function destroy(Request $request, User $usuario): Response
    {
        abort_if(
            $request->user()->is($usuario),
            422,
            'Você não pode excluir o seu próprio acesso.'
        );

        $this->recusarSeUltimoAdministrador(
            $usuario,
            true,
            'Esta é a única pessoa com perfil de Administrador ativo: o sistema ficaria sem quem administra.'
        );

        $usuario->delete();

        return response()->noContent();
    }

    /**
     * Um HC Brain sem administrador ativo é um sistema que ninguém consegue
     * mais governar — e não há como desfazer isso pela interface.
     */
    private function recusarSeUltimoAdministrador(User $usuario, bool $perderiaOPerfil, string $mensagem): void
    {
        if (! $perderiaOPerfil || $usuario->perfil !== 'Administrador' || $usuario->status !== 'Ativo') {
            return;
        }

        $outros = User::where('perfil', 'Administrador')
            ->where('status', 'Ativo')
            ->whereKeyNot($usuario->getKey())
            ->exists();

        abort_if(! $outros, 422, $mensagem);
    }
}
