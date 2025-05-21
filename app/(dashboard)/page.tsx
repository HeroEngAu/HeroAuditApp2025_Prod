import '../globals.css';
//import { GetFormStats } from "../../actions/form";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { ReactNode, Suspense } from "react";
//import { LuView } from "react-icons/lu";
//import { FaWpforms } from "react-icons/fa";
//import { HiCursorClick } from "react-icons/hi";
//import { TbArrowBounce } from "react-icons/tb";
import { Separator } from "../../components/ui/separator";
import CreateFormDialog from "../../components/CreateFormDialog";
//import Badge from "../../components/ui/badge";
//import { formatDistance } from "date-fns/formatDistance";
//import { Button } from "../../components/ui/button";
//import Link from "next/link";
//import { BiRightArrowAlt } from "react-icons/bi";
//import { FaEdit } from "react-icons/fa";
import { Amplify } from "aws-amplify"
import outputs from "../../amplify_outputs.json"
//import SearchBar from "../../components/searchBar";
//import { type Schema } from '../../amplify/data/resource';

//type Form = Schema['Form']['type'];
Amplify.configure(outputs)

export default function Home() {

  return (
    <div className="container pt-4">
      {/*<Suspense fallback={<StatsCards loading={true} />}>
        <CardStatsWrapper />
      </Suspense>*/}
      <Separator className="my-6" />
      <h2 className="text-4xl font-bold col-span-2">Your forms</h2>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">

        <CreateFormDialog   />
        <Suspense
          fallback={[1, 2, 3, 4].map((el) => (
            <FormCardSkeleton key={el} />
          ))}
        >
          {/*}<FormCards />*/}
        </Suspense>
      </div>
    </div>
  );
}

/*async function CardStatsWrapper() {
  const stats = await GetFormStats();
  return <StatsCards loading={false} data={stats} />;
}

interface StatsCardProps {
  data?: Awaited<ReturnType<typeof GetFormStats>>;
  loading: boolean;
}

function StatsCards(props: StatsCardProps) {
  const { data, loading } = props;

  return (
    <div className="w-full pt-8 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total visits"
        icon={<LuView className="text-blue-600" />}
        helperText="All time form visits"
        value={data?.visits.toLocaleString() || ""}
        loading={loading}
        className="shadow-md shadow-blue-600"
      />

      <StatsCard
        title="Total submissions"
        icon={<FaWpforms className="text-yellow-600" />}
        helperText="All time form submissions"
        value={data?.submissions.toLocaleString() || ""}
        loading={loading}
        className="shadow-md shadow-yellow-600"
      />

      <StatsCard
        title="Submission rate"
        icon={<HiCursorClick className="text-green-600" />}
        helperText="Visits that result in form submission"
        value={data?.submissionRate.toLocaleString() + "%" || ""}
        loading={loading}
        className="shadow-md shadow-green-600"
      />

      <StatsCard
        title="Bounce rate"
        icon={<TbArrowBounce className="text-red-600" />}
        helperText="Visits that leaves without interacting"
        value={data?.submissionRate.toLocaleString() + "%" || ""}
        loading={loading}
        className="shadow-md shadow-red-600"
      />
    </div>

  );
}*/

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

/*async function FormCards() {
  const formsInfo = await GetFormsInformation();

  const allForms = formsInfo.flatMap((entry) =>
    entry.forms.map((form) => ({
      ...form,
      clientName: entry.clientName,
      projectName: entry.projectName,
      projectID: entry.projectID,
    }))
  );

  return (
    <>
      {allForms.map((form) => (
        <FormCard key={form.id} form={form} />
      ))}
    </>
  );
}*/

/*type CustomForm = {
  id: string;
  name: string | null;
  description?: string | null;
  published: boolean | null;
  content?: string | null;
  clientName: string;
  projectName: string;
  projectID: string;
  createdAt?: string | null;
  visits?: number | null;
  submissions?: number | null;
};*/


/*function FormCard({ form }: { form: CustomForm }) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <span className="truncate font-bold">{form.name}</span>
          {form.published && <Badge>Published</Badge>}
          {!form.published && <Badge variant={"destructive"}>Draft</Badge>}
        </CardTitle>
        <CardDescription className="flex items-center justify-between text-muted-foreground text-sm">
          {form.createdAt ? (
            formatDistance(new Date(form.createdAt), new Date(), { addSuffix: true })
          ) : (
            "No date"
          )}
          {form.published && (
            <span className="flex items-center gap-2">
              <LuView className="text-muted-foreground" />
              <span>{form.visits ?? "[]".toLocaleString()}</span>
              <FaWpforms className="text-muted-foreground" />
              <span>{form.submissions ?? "[]".toLocaleString()}</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[20px] truncate text-sm text-muted-foreground">
        <p>Client: {form.clientName}</p>
      </CardContent>
      <CardContent className="h-[20px] truncate text-sm text-muted-foreground">
        <p>Project: {form.projectName} ({form.projectID})</p>
      </CardContent>
      <CardContent className="h-[20px] truncate text-sm text-muted-foreground text-wrap">
      <p>Description: {form.description || "No description"}</p>
      </CardContent>
      <CardFooter>
        {form.published && (
          <Button asChild className="w-full mt-2 text-md gap-4">
            <Link href={`/forms/${form.id}`}>
              View submissions <BiRightArrowAlt />
            </Link>
          </Button>

        )}
        {!form.published && (
          <Button asChild variant={"secondary"} className="w-full mt-2 text-md gap-4">
            <Link href={`/builder/${form.id}`}>
              Edit form <FaEdit />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}*/
