export async function navigateToLogin() {
  const { default: router } = await import("@/router");

  await router.navigate("/login", { replace: true });
}
