import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:graphql/client.dart';

import '../../core/graphql_client.dart';
import '../tasks/tasks_repository.dart';
import 'board.dart';

final boardsRepositoryProvider = Provider<BoardsRepository>(
  (ref) => BoardsRepository(ref.watch(graphQLClientProvider)),
);

const _boardFields = 'id name openTaskCount owner { id name email }';

class BoardsRepository {
  BoardsRepository(this._client);
  final GraphQLClient _client;

  Future<List<Board>> boards() async {
    final data = await _client.queryData(
      'query Boards { boards { $_boardFields } }',
    );
    return [
      for (final board in data['boards'] as List)
        Board.fromJson(board as Map<String, dynamic>),
    ];
  }

  Future<Board> board(String id) async {
    final data = await _client.queryData(
      '''
      query Board(\$id: ID!) {
        board(id: \$id) { $_boardFields tasks { $boardTaskFields } }
      }
      ''',
      {'id': id},
    );
    return Board.fromJson(data['board'] as Map<String, dynamic>);
  }

  Future<Board> createBoard(String name) async {
    final data = await _client.mutateData(
      '''
      mutation CreateBoard(\$input: CreateBoardInput!) {
        createBoard(input: \$input) { $_boardFields }
      }
      ''',
      {
        'input': {'name': name},
      },
    );
    return Board.fromJson(data['createBoard'] as Map<String, dynamic>);
  }

  Future<Board> updateBoard(String id, String name) async {
    final data = await _client.mutateData(
      '''
      mutation UpdateBoard(\$input: UpdateBoardInput!) {
        updateBoard(input: \$input) { $_boardFields }
      }
      ''',
      {
        'input': {'id': id, 'name': name},
      },
    );
    return Board.fromJson(data['updateBoard'] as Map<String, dynamic>);
  }

  Future<void> deleteBoard(String id) => _client.mutateData(
    r'mutation DeleteBoard($id: ID!) { deleteBoard(id: $id) }',
    {'id': id},
  );
}
