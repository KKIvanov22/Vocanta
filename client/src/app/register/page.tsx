import RegisterPage from "./Register";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <RegisterPage error={error} />;
}
