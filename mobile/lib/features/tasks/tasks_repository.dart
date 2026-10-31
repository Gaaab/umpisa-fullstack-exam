import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:graphql/client.dart';

import '../../core/graphql/operations.g.dart';
import '../../core/graphql_client.dart';
import '../auth/user.dart';
import 'task.dart';

final tasksRepositoryProvider = Provider<TasksRepository>(
  (ref) => TasksRepository(ref.watch(graphQLClientProvider)),
);

class TasksRepository {
  TasksRepository(this._client);
  final GraphQLClient _client;

  Future<Task> task(String id) async {
    final data = await _client.queryData(taskQuery, {'id': id});
    return Task.fromJson(data['task'] as Map<String, dynamic>);
  }

  Future<List<Task>> myTasks() async {
    final data = await _client.queryData(myTasksQuery);
    return [
      for (final task in data['myTasks'] as List)
        Task.fromJson(task as Map<String, dynamic>),
    ];
  }

  Future<List<User>> users() async {
    final data = await _client.queryData(usersQuery);
    return [
      for (final user in data['users'] as List)
        User.fromJson(user as Map<String, dynamic>),
    ];
  }

  Future<Task> createTask({
    required String boardId,
    required String title,
    String? description,
    String? assigneeId,
  }) async {
    final data = await _client.mutateData(createTaskMutation, {
      'input': {
        'boardId': boardId,
        'title': title,
        'description': description,
        'assigneeId': assigneeId,
      },
    });
    return Task.fromJson(data['createTask'] as Map<String, dynamic>);
  }

  /// Omitted keys stay unchanged; `assigneeId: null` unassigns.
  Future<Task> updateTask(String id, Map<String, Object?> changes) async {
    final data = await _client.mutateData(updateTaskMutation, {
      'input': {'id': id, ...changes},
    });
    return Task.fromJson(data['updateTask'] as Map<String, dynamic>);
  }

  Future<void> deleteTask(String id) =>
      _client.mutateData(deleteTaskMutation, {'id': id});

  Future<void> addComment(String taskId, String body) =>
      _client.mutateData(addCommentMutation, {
        'input': {'taskId': taskId, 'body': body},
      });
}
