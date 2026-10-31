import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:graphql/client.dart';

import '../../core/graphql/operations.g.dart';
import '../../core/graphql_client.dart';
import 'board.dart';

final boardsRepositoryProvider = Provider<BoardsRepository>(
  (ref) => BoardsRepository(ref.watch(graphQLClientProvider)),
);

class BoardsRepository {
  BoardsRepository(this._client);
  final GraphQLClient _client;

  Future<List<Board>> boards() async {
    final data = await _client.queryData(boardsQuery);
    return [
      for (final board in data['boards'] as List)
        Board.fromJson(board as Map<String, dynamic>),
    ];
  }

  Future<Board> board(String id) async {
    final data = await _client.queryData(boardQuery, {'id': id});
    return Board.fromJson(data['board'] as Map<String, dynamic>);
  }

  Future<Board> createBoard(String name) async {
    final data = await _client.mutateData(createBoardMutation, {
      'input': {'name': name},
    });
    return Board.fromJson(data['createBoard'] as Map<String, dynamic>);
  }

  Future<Board> updateBoard(String id, String name) async {
    final data = await _client.mutateData(updateBoardMutation, {
      'input': {'id': id, 'name': name},
    });
    return Board.fromJson(data['updateBoard'] as Map<String, dynamic>);
  }

  Future<void> deleteBoard(String id) =>
      _client.mutateData(deleteBoardMutation, {'id': id});
}
