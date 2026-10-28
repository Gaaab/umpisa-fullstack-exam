import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskboard/core/graphql_client.dart';
import 'package:taskboard/features/boards/boards_providers.dart';
import 'package:taskboard/features/boards/boards_repository.dart';
import 'package:taskboard/features/tasks/task.dart';
import 'package:taskboard/features/tasks/tasks_repository.dart';

import '../../fakes.dart';

void main() {
  late FakeApi api;
  late ProviderContainer container;

  setUp(() {
    api = FakeApi();
    container = ProviderContainer(
      retry: (_, _) => null,
      overrides: [
        boardsRepositoryProvider.overrideWithValue(api),
        tasksRepositoryProvider.overrideWithValue(api),
      ],
    );
    addTearDown(container.dispose);
  });

  Future<Task> loadTask(String id) async {
    container.listen(boardProvider('b1'), (_, _) {});
    final board = await container.read(boardProvider('b1').future);
    return board.tasks.firstWhere((task) => task.id == id);
  }

  TaskStatus statusOf(String id) => container
      .read(boardProvider('b1'))
      .requireValue
      .tasks
      .firstWhere((task) => task.id == id)
      .status;

  test('moves the task before the server answers', () async {
    final task = await loadTask('t1');
    api.holdUpdates = Completer();

    final move = container
        .read(boardProvider('b1').notifier)
        .moveTask(task, TaskStatus.inProgress);
    expect(statusOf('t1'), TaskStatus.inProgress);

    api.holdUpdates!.complete();
    await move;
    expect(statusOf('t1'), TaskStatus.inProgress);
    expect(api.tasks.first.status, TaskStatus.inProgress);
  });

  test('puts the task back when the server rejects the move', () async {
    final task = await loadTask('t1');
    api
      ..holdUpdates = Completer()
      ..rejectedTasks.add('t1');

    final move = container
        .read(boardProvider('b1').notifier)
        .moveTask(task, TaskStatus.done);
    expect(statusOf('t1'), TaskStatus.done);

    api.holdUpdates!.complete();
    await expectLater(move, throwsA(isA<ApiException>()));
    expect(statusOf('t1'), TaskStatus.todo);
  });

  test('a rejected move leaves concurrent moves alone', () async {
    final first = await loadTask('t1');
    final second = await loadTask('t2');
    final notifier = container.read(boardProvider('b1').notifier);
    api
      ..holdUpdates = Completer()
      ..rejectedTasks.add('t1');

    final rejected = notifier.moveTask(first, TaskStatus.done);
    final accepted = notifier.moveTask(second, TaskStatus.inProgress);
    api.holdUpdates!.complete();
    await expectLater(rejected, throwsA(isA<ApiException>()));
    await accepted;

    expect(statusOf('t1'), TaskStatus.todo);
    expect(statusOf('t2'), TaskStatus.inProgress);
  });
}
