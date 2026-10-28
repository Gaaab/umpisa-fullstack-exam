import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/tasks/task.dart';
import '../features/tasks/task_assigned.dart';
import '../features/tasks/tasks_providers.dart';
import 'theme.dart';

/// Signed-in chrome: the bottom tab bar, plus the live assignment toast.
class HomeShell extends ConsumerWidget {
  const HomeShell({super.key, required this.shell});

  final StatefulNavigationShell shell;

  void _announce(BuildContext context, WidgetRef ref, TaskAssignment event) {
    ref.invalidate(myTasksProvider);
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text('${event.assignedBy} assigned you "${event.title}"'),
          action: SnackBarAction(
            label: 'View',
            onPressed: () =>
                GoRouter.of(context).push('/tasks/${event.taskId}'),
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen(taskAssignedProvider, (_, next) {
      if (next case AsyncData(:final value)) _announce(context, ref, value);
    });

    return Scaffold(
      body: shell,
      bottomNavigationBar: CupertinoTabBar(
        currentIndex: shell.currentIndex,
        // Tapping the active tab pops it back to its root, as on iOS.
        onTap: (index) =>
            shell.goBranch(index, initialLocation: index == shell.currentIndex),
        activeColor: AppColors.cobalt,
        inactiveColor: AppColors.graphite,
        backgroundColor: AppColors.paper,
        border: const Border(
          top: BorderSide(color: AppColors.line, width: 0.5),
        ),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.view_kanban_outlined),
            activeIcon: Icon(Icons.view_kanban),
            label: 'Boards',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.checklist_rounded),
            label: 'My tasks',
          ),
        ],
      ),
    );
  }
}
