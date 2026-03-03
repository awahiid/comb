import CombLogo from "@/assets/comb-ai.svg"
import EmailCard from "@/components/email/email-card";
import DataTable from "@/components/data/data-table";
import CompanyCard from "@/components/company/company-card";
import ConfigurationCard from "@/components/config/configuration-card";
import SaveDataButton from "@/components/layout/save-data-button";
import CompanyEmails from "@/components/company/company-emails";

export default function Home() {

  return  <>
      <header className="sticky top-5 z-100 max-w-3xl mx-auto my-5 flex py-2 px-4 rounded-full bg-background/10 border w-full backdrop-blur-2xl  items-center justify-between">
          <div className={"flex items-center gap-1 justify-baseline"}>
              <CombLogo className="w-5 h-auto rotate-180" />
              <p className={"font-bold text-lg mb-1"}>comb</p>
              <p className={"text-sm"}>made by @awahiid</p>
          </div>
          <div className={"flex items-center gap-2"}>
              <ConfigurationCard/>
              <SaveDataButton/>
          </div>
      </header>
      <main className="flex flex-col h-full items-center gap-10 font-sans pb-10">
          <section className={"flex gap-5 w-full justify-center"}>
              <CompanyCard/>
              <div className={"flex flex-col gap-2"}>
                  <CompanyEmails/>
                  <EmailCard/>
              </div>
          </section>
          <DataTable/>
      </main>
  </>
}