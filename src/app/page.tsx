import CombLogo from "@/assets/comb-ai.svg"
import EmailCard from "@/components/email/email-card";
import DataTable from "@/components/data/data-table";
import CompanyCard from "@/components/company/company-card";
import ConfigurationCard from "@/components/config/configuration-card";
import SaveDataButton from "@/components/layout/save-data-button";

export default function Home() {

  return <>
      <main className="flex justify-center h-9/10 gap-4">
          <CompanyCard/>
          <EmailCard/>
          <DataTable/>
      </main>
      <footer className={"w-full mt-10"}>
          <nav className="h-fit max-w-3xl mx-auto flex py-2 px-4 rounded-full border w-full backdrop-blur-2xl items-center justify-between">
              <div className={"flex items-center gap-1 justify-baseline"}>
                  <CombLogo className="w-5 h-auto rotate-180" />
                  <p className={"font-bold text-lg mb-1"}>comb</p>
                  <p className={"text-sm"}>made by @awahiid</p>
              </div>
              <div className={"flex items-center gap-2"}>
                  <ConfigurationCard/>
                  <SaveDataButton/>
              </div>
          </nav>
      </footer>
  </>
}