import 'package:flutter/cupertino.dart' show CupertinoSliverRefreshControl;
import 'package:flutter/material.dart';

/// Scroll view with an iOS large title that collapses on scroll, and native
/// pull-to-refresh when [onRefresh] is set.
class LargeTitleView extends StatelessWidget {
  const LargeTitleView({
    super.key,
    required this.title,
    required this.slivers,
    this.actions,
    this.onRefresh,
  });

  final String title;
  final List<Widget> slivers;
  final List<Widget>? actions;
  final RefreshCallback? onRefresh;

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(
        parent: BouncingScrollPhysics(),
      ),
      slivers: [
        SliverAppBar.large(
          // Material's 152 leaves a gap that iOS large titles don't have.
          expandedHeight: 120,
          title: Text(title),
          actions: actions,
        ),
        if (onRefresh != null)
          CupertinoSliverRefreshControl(
            // Failures already show through the provider's error state.
            onRefresh: () => onRefresh!().catchError((Object _) {}),
          ),
        ...slivers,
      ],
    );
  }
}
