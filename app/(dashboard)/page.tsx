import '../globals.css';
//import { GetFormStats } from "../../actions/form";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { ReactNode, Suspense } from "react";
/*import { LuView } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa";
import { HiCursorClick } from "react-icons/hi";
import { TbArrowBounce } from "react-icons/tb";*/
import { Separator } from "../../components/ui/separator";
import { Amplify } from "aws-amplify"
import outputs from "../../amplify_outputs.json"
import FilteredFormCards from "../../components/FilteredFormCards"
import SearchBar from '../../components/SearchBar';

Amplify.configure(outputs)

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const searchTerm = params.search || "";
    return (
    <div className="container pt-4">
      

      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <h2 className="text-4xl font-bold">Your forms</h2>
        <SearchBar initialValue={searchTerm} />
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        
        <Suspense
          fallback={[1, 2, 3, 4].map((el) => (
            <FormCardSkeleton key={el} />
          ))}
        >
          <FilteredFormCards searchTerm={searchTerm} />
        </Suspense>
      </div>
       </div>
  );
}

export function StatsCard({
  title,
  value,
  icon,
  helperText,
  loading,
  className,
}: {
  title: string;
  value: string;
  helperText: string;
  className: string;
  loading: boolean;
  icon: ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading && (
            <Skeleton>
              <span className="opacity-0">0</span>
            </Skeleton>
          )}
          {!loading && value}
        </div>
        <p className="text-xs text-muted-foreground pt-1">{helperText}</p>
      </CardContent>
    </Card>
  );
}

function FormCardSkeleton() {
  return <Skeleton className="border-2 border-primary-/20 h-[190px] w-full" />;
}