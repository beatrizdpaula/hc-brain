<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

/**
 * Porta de entrada do HC Brain. A sessão é a do Laravel, então ela vale para
 * todas as telas e some de uma vez quando a pessoa sai.
 */
class LoginController extends Controller
{
    /** Lembra só o e-mail para preencher o campo; a sessão em si é a do Laravel. */
    private const COOKIE_EMAIL = 'hc_brain_email';

    private const DIAS_LEMBRADOS = 30;

    public function create(Request $request): View
    {
        return view('telas.login', [
            'emailLembrado' => $request->cookie(self::COOKIE_EMAIL),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $dados = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $lembrar = $request->boolean('remember');

        if (! Auth::attempt($dados, $lembrar)) {
            throw ValidationException::withMessages([
                'email' => 'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
            ]);
        }

        $request->session()->regenerate();

        $usuario = $request->user();
        $usuario->forceFill(['ultimo_acesso' => now()])->save();

        if ($lembrar) {
            Cookie::queue(self::COOKIE_EMAIL, $usuario->email, self::DIAS_LEMBRADOS * 24 * 60);
        } else {
            Cookie::queue(Cookie::forget(self::COOKIE_EMAIL));
        }

        return redirect()->intended('/');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
