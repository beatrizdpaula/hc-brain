<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CadastrarUsuarioRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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
}
