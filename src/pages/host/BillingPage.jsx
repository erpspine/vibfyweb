import { CreditCard } from 'lucide-react';
import { PageHeading } from '../../components/ui';

export default function BillingPage() {
  return <><PageHeading title="Billing" /><section className="venue-empty"><CreditCard size={28} /><h2>Billing is not available yet</h2><p>Subscriptions, invoices, and payment methods are not connected to your host account yet.</p></section></>;
}
