import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router.dart';
import 'core/theme.dart';
import 'features/boards/board_activity.dart';

final _theme = buildTheme();

class TaskboardApp extends ConsumerWidget {
  const TaskboardApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Up here so every screen stays fresh, whatever route is on top.
    ref.listen(boardActivityProvider, (_, next) {
      if (next case AsyncData(:final value)) syncBoardEvent(ref, value);
    });

    return MaterialApp.router(
      title: 'Taskboard',
      debugShowCheckedModeBanner: false,
      theme: _theme,
      routerConfig: ref.watch(routerProvider),
    );
  }
}
