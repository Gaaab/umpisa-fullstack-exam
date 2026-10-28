import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../tasks/task.dart';
import '../tasks/tasks_providers.dart';
import '../tasks/tasks_repository.dart';
import 'board.dart';
import 'boards_repository.dart';

final boardsProvider = FutureProvider.autoDispose<List<Board>>(
  (ref) => ref.watch(boardsRepositoryProvider).boards(),
);

final boardProvider = AsyncNotifierProvider.autoDispose
    .family<BoardController, Board, String>(BoardController.new);

/// One board with its tasks. Mutations update it in place and refresh the
/// lists they affect elsewhere.
class BoardController extends AsyncNotifier<Board> {
  BoardController(this.id);
  final String id;

  BoardsRepository get _boards => ref.read(boardsRepositoryProvider);
  TasksRepository get _tasks => ref.read(tasksRepositoryProvider);

  @override
  Future<Board> build() => ref.watch(boardsRepositoryProvider).board(id);

  Future<void> rename(String name) async {
    final updated = await _boards.updateBoard(id, name);
    _update((board) => board.copyWith(name: updated.name));
    _refreshLists();
  }

  Future<void> delete() async {
    await _boards.deleteBoard(id);
    _refreshLists();
  }

  Future<void> addTask({
    required String title,
    String? description,
    String? assigneeId,
  }) async {
    final task = await _tasks.createTask(
      boardId: id,
      title: title,
      description: description,
      assigneeId: assigneeId,
    );
    _update((board) => board.copyWith(tasks: [...board.tasks, task]));
    _refreshLists();
  }

  /// Moves the card first, then puts only this card back if the server
  /// rejects it, so other moves made meanwhile survive.
  Future<void> moveTask(Task task, TaskStatus status) async {
    _replace(task.copyWith(status: status));
    try {
      await _tasks.updateTask(task.id, {'status': status.value});
    } catch (_) {
      _replace(task);
      rethrow;
    }
    _refreshLists(taskId: task.id);
  }

  void _replace(Task task) => _update(
    (board) => board.copyWith(
      tasks: [for (final t in board.tasks) t.id == task.id ? task : t],
    ),
  );

  void _update(Board Function(Board board) change) {
    if (!ref.mounted) return;
    final board = state.value;
    if (board != null) state = AsyncData(change(board));
  }

  void _refreshLists({String? taskId}) {
    if (!ref.mounted) return;
    ref
      ..invalidate(boardsProvider)
      ..invalidate(myTasksProvider);
    if (taskId != null) ref.invalidate(taskProvider(taskId));
  }
}
