import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import '../../widgets/action_sheet.dart';
import '../../widgets/avatar.dart';
import '../../widgets/loading_button.dart';
import '../../widgets/states.dart';
import '../../widgets/status_control.dart';
import '../auth/user.dart';
import '../boards/board_activity.dart';
import '../boards/boards_providers.dart';
import 'assignee_field.dart';
import 'task.dart';
import 'tasks_providers.dart';
import 'tasks_repository.dart';

class TaskDetailScreen extends ConsumerWidget {
  const TaskDetailScreen({super.key, required this.id});

  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return switch (ref.watch(taskProvider(id))) {
      AsyncError() => Scaffold(
        appBar: AppBar(),
        body: ErrorState(
          message:
              "Couldn't load this task. Check your connection and try again.",
          onRetry: () => ref.invalidate(taskProvider(id)),
        ),
      ),
      AsyncValue(:final value?) => _TaskDetail(task: value),
      _ => Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator.adaptive()),
      ),
    };
  }
}

/// Keeps its own form state, so refetches (after a comment, or a live
/// change from someone else) never overwrite unsaved edits.
class _TaskDetail extends ConsumerStatefulWidget {
  const _TaskDetail({required this.task});

  final Task task;

  @override
  ConsumerState<_TaskDetail> createState() => _TaskDetailState();
}

class _TaskDetailState extends ConsumerState<_TaskDetail> {
  final _formKey = GlobalKey<FormState>();
  late final _title = TextEditingController(text: widget.task.title);
  late final _description = TextEditingController(
    text: widget.task.description,
  );
  final _comment = TextEditingController();
  late var _status = widget.task.status;
  late User? _assignee = widget.task.assignee;
  bool _saving = false;
  bool _posting = false;
  // Set while this client deletes the task, so its own event is ignored.
  bool _deleting = false;
  // Deleted elsewhere while this screen was hidden.
  bool _gone = false;

  Task get _task => widget.task;
  TasksRepository get _repository => ref.read(tasksRepositoryProvider);

  @override
  void didUpdateWidget(_TaskDetail oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Take changes made elsewhere, but only into fields the user left alone.
    final before = oldWidget.task;
    final after = widget.task;
    _merge(_title, before.title, after.title);
    _merge(_description, before.description ?? '', after.description ?? '');
    if (_status == before.status) _status = after.status;
    if (_assignee?.id == before.assignee?.id) _assignee = after.assignee;
  }

  void _merge(TextEditingController field, String before, String after) {
    if (field.text == before && before != after) field.text = after;
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _comment.dispose();
    super.dispose();
  }

  void _toast(String message) => ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message)));

  void _refreshLists() {
    ref
      ..invalidate(boardsProvider)
      ..invalidate(myTasksProvider);
    if (_task.boardId case final boardId?) {
      ref.invalidate(boardProvider(boardId));
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await _repository.updateTask(_task.id, {
        'title': _title.text.trim(),
        'description': _description.text.trim(),
        'status': _status.value,
        'assigneeId': _assignee?.id,
      });
      if (!mounted) return;
      _refreshLists();
      ref.invalidate(taskProvider(_task.id));
      _toast('Changes saved');
    } catch (error) {
      if (mounted) _toast(error.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _post() async {
    setState(() => _posting = true);
    try {
      await _repository.addComment(_task.id, _comment.text.trim());
      _comment.clear();
      if (!mounted) return;
      ref.invalidate(taskProvider(_task.id));
      await ref.read(taskProvider(_task.id).future);
    } catch (error) {
      if (mounted) _toast(error.toString());
    } finally {
      if (mounted) setState(() => _posting = false);
    }
  }

  Future<void> _delete() async {
    final confirmed = await showActionSheet<bool>(
      context,
      title: 'Delete "${_task.title}"?',
      message: 'Its comments are deleted too.',
      actions: const [SheetAction('Delete task', true, destructive: true)],
    );
    if (confirmed != true || !mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    final router = GoRouter.of(context);
    _deleting = true;
    try {
      await _repository.deleteTask(_task.id);
      if (!mounted) return;
      _refreshLists();
      router.pop();
      messenger.showSnackBar(const SnackBar(content: Text('Task deleted')));
    } catch (error) {
      _deleting = false;
      if (mounted) _toast(error.toString());
    }
  }

  /// Someone else deleted this task or its board. Leave if it's on screen
  /// (back to the board, or to Boards when the board is gone); otherwise
  /// say so when the user comes back to it.
  void _deletedElsewhere({required bool boardGone}) {
    if (!TickerMode.valuesOf(context).enabled) {
      setState(() => _gone = true);
      return;
    }
    final messenger = ScaffoldMessenger.of(context);
    final router = GoRouter.of(context);
    final boardId = _task.boardId;
    if (!boardGone && router.canPop()) {
      router.pop();
    } else {
      router.go(boardGone || boardId == null ? '/boards' : '/boards/$boardId');
    }
    messenger
      ..hideCurrentSnackBar()
      ..showSnackBar(const SnackBar(content: Text('This task was deleted')));
  }

  String _date(DateTime time) =>
      MaterialLocalizations.of(context).formatShortMonthDay(time.toLocal());

  @override
  Widget build(BuildContext context) {
    ref.listen(boardActivityProvider, (_, next) {
      if (next case AsyncData(:final value) when !_deleting) {
        final boardGone =
            value.type == BoardEventType.boardDeleted &&
            value.boardId == _task.boardId;
        final taskGone =
            value.type == BoardEventType.taskDeleted &&
            value.taskId == _task.id;
        if (boardGone || taskGone) _deletedElsewhere(boardGone: boardGone);
      }
    });
    if (_gone) {
      return Scaffold(
        appBar: AppBar(),
        body: const EmptyState(message: 'This task was deleted.'),
      );
    }

    final text = Theme.of(context).textTheme;
    final created = _task.createdAt;
    final updated = _task.updatedAt;

    return Scaffold(
      appBar: AppBar(
        title: Text(_task.boardName ?? 'Task'),
        actions: [
          IconButton(
            tooltip: 'Delete task',
            icon: const Icon(Icons.delete_outline_rounded),
            color: AppColors.brick,
            onPressed: _delete,
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(
          16,
          8,
          16,
          24 + MediaQuery.paddingOf(context).bottom,
        ),
        children: [
          Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _title,
                  // Wraps long titles; return still submits, never adds a newline.
                  minLines: 1,
                  maxLines: 3,
                  textInputAction: TextInputAction.done,
                  maxLength: 120,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: const InputDecoration(labelText: 'Title'),
                  validator: (value) => (value == null || value.trim().isEmpty)
                      ? 'Task title is required'
                      : null,
                ),
                const SizedBox(height: 4),
                TextFormField(
                  controller: _description,
                  minLines: 3,
                  maxLines: 8,
                  textCapitalization: TextCapitalization.sentences,
                  inputFormatters: [LengthLimitingTextInputFormatter(2000)],
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 20),
                Text('Status', style: text.labelLarge),
                const SizedBox(height: 8),
                StatusControl(
                  value: _status,
                  onChanged: (status) {
                    HapticFeedback.selectionClick();
                    setState(() => _status = status);
                  },
                ),
                const SizedBox(height: 20),
                AssigneeField(
                  value: _assignee,
                  onChanged: (user) => setState(() => _assignee = user),
                ),
                const SizedBox(height: 20),
                LoadingButton(
                  label: 'Save changes',
                  loading: _saving,
                  onPressed: _save,
                ),
                if (created != null && updated != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    'Created ${_date(created)} · Updated ${_date(updated)}',
                    style: text.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 32),
          Text('Comments', style: text.titleMedium),
          const SizedBox(height: 12),
          if (_task.comments.isEmpty)
            Text('No comments yet.', style: text.bodySmall)
          else
            for (final comment in _task.comments) _CommentTile(comment),
          const SizedBox(height: 12),
          TextField(
            controller: _comment,
            minLines: 1,
            maxLines: 4,
            textCapitalization: TextCapitalization.sentences,
            inputFormatters: [LengthLimitingTextInputFormatter(1000)],
            decoration: const InputDecoration(labelText: 'Write a comment'),
          ),
          const SizedBox(height: 12),
          ValueListenableBuilder(
            valueListenable: _comment,
            builder: (_, value, _) => LoadingButton(
              label: 'Post comment',
              loading: _posting,
              onPressed: value.text.trim().isEmpty ? null : _post,
            ),
          ),
        ],
      ),
    );
  }
}

class _CommentTile extends StatelessWidget {
  const _CommentTile(this.comment);

  final Comment comment;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final l10n = MaterialLocalizations.of(context);
    final time = comment.createdAt.toLocal();

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Avatar(comment.author.name, size: 32),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text.rich(
                  TextSpan(
                    text: comment.author.name,
                    style: text.titleSmall,
                    children: [
                      TextSpan(
                        text:
                            '  ${l10n.formatShortMonthDay(time)}, '
                            '${l10n.formatTimeOfDay(TimeOfDay.fromDateTime(time))}',
                        style: text.bodySmall,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 2),
                Text(comment.body, style: text.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
