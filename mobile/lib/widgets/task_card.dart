import 'package:flutter/material.dart';

import '../core/theme.dart';
import '../features/tasks/task.dart';
import 'avatar.dart';

/// Index card: flat paper with a thick status-coloured top edge.
class TaskCard extends StatelessWidget {
  const TaskCard({
    super.key,
    required this.task,
    required this.onTap,
    required this.onMore,
  });

  final Task task;
  final VoidCallback onTap;
  final VoidCallback onMore;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final assignee = task.assignee?.name;

    return Material(
      color: AppColors.paper,
      borderRadius: const BorderRadius.all(Radius.circular(10)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ColoredBox(
              color: task.status.edge,
              child: const SizedBox(height: 4),
            ),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 0, 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          task.title,
                          style: text.titleSmall,
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            if (assignee != null) ...[
                              Avatar(assignee, size: 24),
                              const SizedBox(width: 8),
                            ],
                            Expanded(
                              child: Text(
                                assignee ?? 'Unassigned',
                                style: text.bodySmall,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                IconButton(
                  tooltip: 'Move task',
                  icon: const Icon(Icons.more_horiz_rounded),
                  color: AppColors.graphite,
                  onPressed: onMore,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
