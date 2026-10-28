import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Modal bottom sheet with a drag handle that stays above the keyboard and
/// the home indicator.
Future<T?> showFormSheet<T>(
  BuildContext context, {
  required String title,
  required WidgetBuilder builder,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    // Cover the tab bar, as iOS sheets do.
    useRootNavigator: true,
    builder: (context) {
      final media = MediaQuery.of(context);
      final bottom = math.max(media.viewInsets.bottom, media.padding.bottom);
      return SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(20, 0, 20, 16 + bottom),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            builder(context),
          ],
        ),
      );
    },
  );
}
