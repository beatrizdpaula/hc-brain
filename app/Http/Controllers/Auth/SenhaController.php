<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\View\View;

/**
 * Recuperação de acesso. O fluxo é o do Laravel: um token com validade curta
 * chega por e-mail e só ele autoriza a troca. A resposta é sempre a mesma,
 * exista ou não a conta, para que a tela não vire uma lista de quem tem
 * acesso ao HC Brain.
 */
class SenhaController extends Controller
{
    public function solicitar(): View
    {
        return view('telas.senha');
    }

    public function enviarLink(Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        Password::sendResetLink($request->only('email'));

        return back()->with('status', 'Se este e-mail tiver acesso ao HC Brain, o link de recuperação chega em instantes.');
    }

    public function redefinir(Request $request, string $token): View
    {
        return view('telas.nova-senha', [
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    public function salvar(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $resultado = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($usuario, string $senha) {
                $usuario->forceFill([
                    'password' => $senha,
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($resultado !== Password::PasswordReset) {
            return back()->withErrors([
                'email' => 'Este link de recuperação não vale mais. Peça um novo.',
            ]);
        }

        return redirect('/login')->with('status', 'Senha alterada. Entre com a nova senha.');
    }
}
