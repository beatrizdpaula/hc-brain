<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * O e-mail de recuperação com a voz do HC Brain e em português — o padrão do
 * Laravel chega em inglês, e quem usa o sistema não fala inglês.
 */
class RedefinirSenha extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $minutos = config('auth.passwords.users.expire');

        return (new MailMessage)
            ->subject('Recuperação de acesso ao HC Brain')
            ->greeting('Olá!')
            ->line('Recebemos um pedido para trocar a senha do seu acesso ao HC Brain.')
            ->action('Definir uma nova senha', $this->resetUrl($notifiable))
            ->line("O link vale por {$minutos} minutos.")
            ->line('Se não foi você quem pediu, pode ignorar esta mensagem: nada muda sem o link acima.')
            ->salutation('Equipe Health Care');
    }

    protected function resetUrl($notifiable): string
    {
        return route('senha.redefinir', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);
    }
}
