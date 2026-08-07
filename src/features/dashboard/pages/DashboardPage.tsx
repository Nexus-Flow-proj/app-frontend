// import { useAuthStore } from "@/store/authStore";
// import { DashboardErrorState } from "../components/DashboardErrorState";
// import { DashboardHeader } from "../components/DashboardHeader";
// import { DashboardSections } from "../components/DashboardSections";
// import { useDashboardSummary } from "../hooks/useDashboardSummary";

// function DashboardPage() {
//   const { data, isLoading, error, refetch, dataUpdatedAt } =
//     useDashboardSummary();
//   const { user } = useAuthStore();

//   return (
//     <main className="mx-auto grid w-full max-w-7xl gap-6 px-1 py-1">
//       <DashboardHeader
//         firstName={user?.firstName}
//         updatedAt={dataUpdatedAt}
//         onRefresh={() => refetch()}
//       />

//       {error ? (
//         <DashboardErrorState message={error} onRetry={() => refetch()} />
//       ) : (
//         <DashboardSections data={data} isLoading={isLoading} />
//       )}
//     </main>
//   );
// }

// export { DashboardPage };
// export default DashboardPage;




import { useAuthStore } from "@/store/authStore";
import { DashboardErrorState } from "../components/DashboardErrorState";
import { DashboardHeader } from "../components/DashboardHeader";
import { AiSummaryCard } from "../components/AiSummaryCard";
import { DashboardSections } from "../components/DashboardSections";
import { useDashboardSummary } from "../hooks/useDashboardSummary";

function DashboardPage() {
  const { data, isLoading, error, refetch, dataUpdatedAt } =
    useDashboardSummary();
  const { user } = useAuthStore();

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-1 py-1">
      <DashboardHeader
        firstName={user?.firstName}
        updatedAt={dataUpdatedAt}
        onRefresh={() => refetch()}
      />

      <AiSummaryCard />

      {error ? (
        <DashboardErrorState message={error} onRetry={() => refetch()} />
      ) : (
        <DashboardSections data={data} isLoading={isLoading} />
      )}
    </main>
  );
}

export { DashboardPage };
export default DashboardPage;