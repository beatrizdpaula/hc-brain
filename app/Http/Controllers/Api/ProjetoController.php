<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjetoResource;
use App\Models\Projeto;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProjetoController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $projetos = Projeto::with('empresa')->orderBy('ordem')->get();

        return ProjetoResource::collection($projetos);
    }
}
