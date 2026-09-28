@extends('errors.layout')

@section('codigo', '419')
@section('titulo', 'Sua sessão expirou')
@section('texto')
  A página ficou aberta tempo demais e o token de segurança venceu. Entre de
  novo para continuar de onde parou.
@endsection
