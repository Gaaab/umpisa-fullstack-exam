import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/loading_button.dart';
import '../tasks/task.dart';
import 'auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    ref
        .read(authControllerProvider.notifier)
        .login(_email.text.trim(), _password.text);
  }

  static String? _required(String? value) =>
      (value == null || value.isEmpty) ? 'Required' : null;

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 360),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const _LaneMark(),
                  const SizedBox(height: 20),
                  Text(
                    'Sign in to Taskboard',
                    style: Theme.of(context).textTheme.headlineSmall
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 24),
                  TextFormField(
                    controller: _email,
                    decoration: const InputDecoration(labelText: 'Email'),
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.email],
                    validator: _required,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _password,
                    decoration: const InputDecoration(labelText: 'Password'),
                    obscureText: true,
                    autofillHints: const [AutofillHints.password],
                    validator: _required,
                    onFieldSubmitted: (_) => _submit(),
                  ),
                  if (auth.hasError) ...[
                    const SizedBox(height: 12),
                    Text(
                      auth.error.toString(),
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  LoadingButton(
                    label: 'Sign in',
                    loading: auth.isLoading,
                    onPressed: _submit,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Demo: alice@example.com / password123',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// The three lane colours as card tabs: the app's only brand mark.
class _LaneMark extends StatelessWidget {
  const _LaneMark();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (final status in TaskStatus.values) ...[
          DecoratedBox(
            decoration: BoxDecoration(
              color: status.edge,
              borderRadius: const BorderRadius.all(Radius.circular(3)),
            ),
            child: const SizedBox(width: 28, height: 6),
          ),
          const SizedBox(width: 6),
        ],
      ],
    );
  }
}
