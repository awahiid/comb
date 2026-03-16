import CombLogo from "@/assets/comb-ai.svg"
import EmailCard from "@/components/email/email-card";
import DataTable from "@/components/data/data-table";
import CompanyCard from "@/components/company/company-card";
import ConfigurationCard from "@/components/config/configuration-card";
import SaveDataButton from "@/components/layout/save-data-button";
import {CombToaster} from "@/components/layout/toaster";

export default function Home() {
  return <>
      <main className="flex justify-center gap-4 h-9/10 max-h-[900] pt-10 px-10 ">
          <CompanyCard/>
          <EmailCard/>
          <DataTable/>
      </main>
      <CombToaster/>
      <nav className="h-fit max-w-2xl mt-6 mx-auto flex py-2 px-4 rounded-sm border w-full bg-card items-center justify-between">
          <div className={"flex items-center gap-1 justify-baseline"}>
              <CombLogo className="w-5 h-auto rotate-180"/>
              <p className={"font-bold text-lg mb-1"}>comb</p>
              <p className={"text-sm"}>v0.0.4 made by @awahiid</p>
          </div>
          <div className={"flex items-center gap-2"}>
              <ConfigurationCard/>
              <SaveDataButton/>
          </div>
      </nav>
  </>
}