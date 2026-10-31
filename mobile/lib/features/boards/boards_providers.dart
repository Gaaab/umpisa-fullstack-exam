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

  // Optimistic statuses by task id. A move stays applied until a fetch that
  // started after the server confirmed it, so a live refresh racing the
  // move never snaps the card back.
  final _moves = <String, TaskStatus>{};
  final _confirmed = <String>{};

  @override
  Future<Board> build() async {
    _moves.removeWhere((taskId, _) => _confirmed.contains(taskId));
    _confirmed.clear();
    final board = await ref.watch(boardsRepositoryProvider).board(id);
    if (_moves.isEmpty) return board;
    return board.copyWith(
      tasks: [
        for (final task in board.tasks) task.copyWith(status: _moves[task.id]),
      ],
    );
  }

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
    // A live refresh may have brought the new task in already.
    _update(
      (board) => board.tasks.any((t) => t.id == task.id)
          ? board
          : board.copyWith(tasks: [...board.tasks, task]),
    );
    _refreshLists();
  }

  /// Moves the card first. If the server rejects it, only this card goes
  /// back, unless it has been moved again since.
  Future<void> moveTask(Task task, TaskStatus status) async {
    _moves[task.id] = status;
    _confirmed.remove(task.id);
    _setStatus(task.id, status);
    bool isLatest() => _moves[task.id] == status;
    try {
      await _tasks.updateTask(task.id, {'status': status.value});
    } catch (_) {
      if (isLatest()) {
        _moves.remove(task.id);
        _setStatus(task.id, task.status);
      }
      rethrow;
    }
    if (isLatest()) _confirmed.add(task.id);
    _refreshLists(taskId: task.id);
  }

  void _setStatus(String taskId, TaskStatus status) => _update(
    (board) => board.copyWith(
      tasks: [
        for (final t in board.tasks)
          t.id == taskId ? t.copyWith(status: status) : t,
      ],
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
