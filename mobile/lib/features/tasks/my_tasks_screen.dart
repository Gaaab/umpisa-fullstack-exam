import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import '../../widgets/large_title_view.dart';
import '../../widgets/states.dart';
import '../../widgets/status_pill.dart';
import 'task.dart';
import 'tasks_providers.dart';

class MyTasksScreen extends ConsumerWidget {
  const MyTasksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasks = ref.watch(myTasksProvider);

    return Scaffold(
      body: LargeTitleView(
        title: 'My tasks',
        onRefresh: () => ref.refresh(myTasksProvider.future),
        slivers: switch (tasks) {
          AsyncError() => [
            SliverFillRemaining(
              hasScrollBody: false,
              child: ErrorState(
                message: "Couldn't load your tasks. Check your connection and try again.",
                onRetry: () => ref.invalidate(myTasksProvider),
              ),
            ),
          ],
          AsyncValue(:final value?) when value.isEmpty => const [
            SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                message: 'Nothing is assigned to you right now.',
              ),
            ),
          ],
          AsyncValue(:final value?) => [
            for (final status in TaskStatus.values)
              if (value.where((task) => task.status == status).toList()
                  case final group when group.isNotEmpty)
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  sliver: SliverToBoxAdapter(
                    child: _StatusGroup(status: status, tasks: group),
                  ),
                ),
          ],
          _ => const [
            SliverFillRemaining(
              hasScrollBody: false,
              child: Center(child: CircularProgressIndicator.adaptive()),
            ),
          ],
        },
      ),
    );
  }
}

class _StatusGroup extends StatelessWidget {
  const _StatusGroup({required this.status, required this.tasks});

  final TaskStatus status;
  final List<Task> tasks;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.paper,
      borderRadius: const BorderRadius.all(Radius.circular(10)),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                StatusPill(status),
                const SizedBox(width: 8),
                Text(
                  '${tasks.length}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
          for (final task in tasks) ...[
            const Divider(indent: 16),
            _TaskRow(task),
          ],
        ],
      ),
    );
  }
}

class _TaskRow extends StatelessWidget {
  const _TaskRow(this.task);

  final Task task;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;

    return InkWell(
      onTap: () => context.push('/tasks/${task.id}'),
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 56),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 8, 10),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(task.title, style: text.titleSmall),
                    if (task.boardName case final board?) ...[
                      const SizedBox(height: 2),
                      Text(board, style: text.bodySmall),
                    ],
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: AppColors.graphite,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
