import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import '../../widgets/action_sheet.dart';
import '../../widgets/form_sheet.dart';
import '../../widgets/large_title_view.dart';
import '../../widgets/states.dart';
import '../../widgets/status_control.dart';
import '../../widgets/task_card.dart';
import '../auth/auth_controller.dart';
import '../tasks/add_task_form.dart';
import '../tasks/task.dart';
import 'board.dart';
import 'board_activity.dart';
import 'board_name_form.dart';
import 'boards_providers.dart';

class BoardScreen extends ConsumerStatefulWidget {
  const BoardScreen({super.key, required this.id});

  final String id;

  @override
  ConsumerState<BoardScreen> createState() => _BoardScreenState();
}

class _BoardScreenState extends ConsumerState<BoardScreen> {
  var _lane = TaskStatus.todo;
  // Set while this client deletes the board, so its own event is ignored.
  var _deleting = false;
  // Deleted elsewhere while this screen was hidden.
  var _gone = false;

  BoardController get _controller =>
      ref.read(boardProvider(widget.id).notifier);

  void _toast(String message) => ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message)));

  Future<void> _move(Task task) async {
    final status = await showActionSheet<TaskStatus>(
      context,
      title: task.title,
      actions: [
        for (final status in TaskStatus.values)
          if (status != task.status)
            SheetAction('Move to ${status.label}', status),
      ],
    );
    if (status == null || !mounted) return;
    HapticFeedback.selectionClick();
    try {
      await _controller.moveTask(task, status);
      if (mounted) _toast('Moved to ${status.label}');
    } catch (_) {
      if (mounted) {
        _toast("Couldn't move the task. Check your connection and try again.");
      }
    }
  }

  Future<void> _addTask() async {
    final added = await showFormSheet<bool>(
      context,
      title: 'Add task',
      builder: (_) => AddTaskForm(boardId: widget.id),
    );
    if (added == true && mounted) {
      setState(() => _lane = TaskStatus.todo);
      _toast('Task added');
    }
  }

  Future<void> _rename(Board board) async {
    final renamed = await showFormSheet<bool>(
      context,
      title: 'Rename board',
      builder: (_) => BoardNameForm(
        submitLabel: 'Save name',
        initialName: board.name,
        onSubmit: _controller.rename,
      ),
    );
    if (renamed == true && mounted) _toast('Board renamed');
  }

  Future<void> _delete(Board board) async {
    final confirmed = await showActionSheet<bool>(
      context,
      title: 'Delete "${board.name}" and its tasks?',
      actions: const [SheetAction('Delete board', true, destructive: true)],
    );
    if (confirmed != true || !mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    final router = GoRouter.of(context);
    _deleting = true;
    try {
      await _controller.delete();
      router.go('/boards');
      messenger.showSnackBar(const SnackBar(content: Text('Board deleted')));
    } catch (error) {
      _deleting = false;
      messenger.showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }

  /// Someone else deleted this board. Leave if it's on screen; otherwise
  /// say so when the user comes back to it.
  void _deletedElsewhere() {
    if (!TickerMode.valuesOf(context).enabled) {
      setState(() => _gone = true);
      return;
    }
    final messenger = ScaffoldMessenger.of(context);
    context.go('/boards');
    messenger
      ..hideCurrentSnackBar()
      ..showSnackBar(const SnackBar(content: Text('This board was deleted')));
  }

  Future<void> _boardActions(Board board) async {
    final action = await showActionSheet<Future<void> Function(Board)>(
      context,
      title: board.name,
      actions: [
        SheetAction('Rename', _rename),
        SheetAction('Delete board', _delete, destructive: true),
      ],
    );
    if (action != null && mounted) await action(board);
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(boardActivityProvider, (_, next) {
      if (next
          case AsyncData(
            value: BoardEvent(
              type: BoardEventType.boardDeleted,
              :final boardId,
            ),
          )
          when boardId == widget.id && !_deleting) {
        _deletedElsewhere();
      }
    });
    final board = ref.watch(boardProvider(widget.id));
    final userId = ref.watch(
      authControllerProvider.select((auth) => auth.value?.id),
    );

    return Scaffold(
      body: switch (board) {
        _ when _gone => LargeTitleView(
          title: '',
          slivers: [
            SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                message: 'This board was deleted.',
                actionLabel: 'Back to boards',
                onAction: () => context.go('/boards'),
              ),
            ),
          ],
        ),
        AsyncError() => LargeTitleView(
          title: '',
          slivers: [
            SliverFillRemaining(
              hasScrollBody: false,
              child: ErrorState(
                message: "Couldn't load this board. Check your connection and try again.",
                onRetry: () => ref.invalidate(boardProvider(widget.id)),
              ),
            ),
          ],
        ),
        AsyncValue(:final value?) => _buildBoard(value, userId),
        _ => const LargeTitleView(
          title: '',
          slivers: [
            SliverFillRemaining(
              hasScrollBody: false,
              child: Center(child: CircularProgressIndicator.adaptive()),
            ),
          ],
        ),
      },
    );
  }

  Widget _buildBoard(Board board, String? userId) {
    final counts = {for (final status in TaskStatus.values) status: 0};
    for (final task in board.tasks) {
      counts[task.status] = counts[task.status]! + 1;
    }
    final tasks = [
      for (final task in board.tasks)
        if (task.status == _lane) task,
    ];
    final open = counts[TaskStatus.todo]! + counts[TaskStatus.inProgress]!;

    return LargeTitleView(
      title: board.name,
      onRefresh: () => ref.refresh(boardProvider(widget.id).future),
      actions: [
        IconButton(
          tooltip: 'Add task',
          icon: const Icon(Icons.add_rounded),
          onPressed: _addTask,
        ),
        if (board.owner.id == userId)
          IconButton(
            tooltip: 'Board actions',
            icon: const Icon(Icons.more_horiz_rounded),
            onPressed: () => _boardActions(board),
          ),
        const SizedBox(width: 4),
      ],
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Owned by ${board.owner.name} · $open open',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
        ),
        SliverPersistentHeader(
          pinned: true,
          delegate: _LaneHeader(
            child: StatusControl(
              value: _lane,
              counts: counts,
              onChanged: (lane) => setState(() => _lane = lane),
            ),
          ),
        ),
        if (tasks.isEmpty)
          SliverFillRemaining(
            hasScrollBody: false,
            child: _lane == TaskStatus.todo
                ? EmptyState(
                    message: 'No tasks in To do yet.',
                    actionLabel: 'Add task',
                    onAction: _addTask,
                  )
                : EmptyState(message: 'No tasks in ${_lane.label}.'),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
            sliver: SliverList.separated(
              itemCount: tasks.length,
              itemBuilder: (_, index) =>
                  _SwipeToMove(task: tasks[index], onMove: _move),
              separatorBuilder: (_, _) => const SizedBox(height: 12),
            ),
          ),
      ],
    );
  }
}

class _SwipeToMove extends StatelessWidget {
  const _SwipeToMove({required this.task, required this.onMove});

  final Task task;
  final ValueChanged<Task> onMove;

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: ValueKey(task.id),
      direction: DismissDirection.endToStart,
      // The swipe only opens the move sheet; the card snaps back.
      confirmDismiss: (_) async {
        onMove(task);
        return false;
      },
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: const BoxDecoration(
          color: AppColors.cobalt,
          borderRadius: BorderRadius.all(Radius.circular(10)),
        ),
        child: const Text(
          'Move',
          style: TextStyle(color: AppColors.paper, fontWeight: FontWeight.w600),
        ),
      ),
      child: TaskCard(
        task: task,
        onTap: () => context.push('/tasks/${task.id}'),
        onMore: () => onMove(task),
      ),
    );
  }
}

class _LaneHeader extends SliverPersistentHeaderDelegate {
  const _LaneHeader({required this.child});

  final Widget child;

  // 44pt control plus 8pt above and below.
  @override
  double get minExtent => 60;

  @override
  double get maxExtent => 60;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    // Joins the collapsed nav bar (paper, hairline) once cards scroll under.
    return DecoratedBox(
      decoration: overlapsContent
          ? const BoxDecoration(
              color: AppColors.paper,
              border: Border(
                bottom: BorderSide(color: AppColors.line, width: 0.5),
              ),
            )
          : const BoxDecoration(color: AppColors.wall),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Center(child: child),
      ),
    );
  }

  @override
  bool shouldRebuild(_LaneHeader oldDelegate) => oldDelegate.child != child;
}
