import { IntegrationWizardForm } from "@/components/integrations/integration-wizard-form";
import type { Connection, Provider } from "@/types/domain";

interface CreateIntegrationFormProps {
  tenantId: string;
  connections: Connection[];
  providers: Provider[];
}

export function CreateIntegrationForm(props: CreateIntegrationFormProps) {
  return <IntegrationWizardForm {...props} />;
}
