import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router.dart';
import 'core/theme.dart';

final _theme = buildTheme();

class TaskboardApp extends ConsumerWidget {
  const TaskboardApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Taskboard',
      debugShowCheckedModeBanner: false,
      theme: _theme,
      routerConfig: ref.watch(routerProvider),
    );
  }
}
