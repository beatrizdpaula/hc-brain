<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProcessoResource;
use App\Models\Processo;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProcessoController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ProcessoResource::collection(Processo::orderBy('ordem')->get());
    }
}
