import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata = {
  title: "Conditions Générales d'Utilisation - TrackFlow",
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <Scale className="h-8 w-8 text-neon-purple" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Conditions Générales d'Utilisation (CGU)</h1>
          <p className="text-sm text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Objet</h2>
            <p>Les présentes Conditions Générales d'Utilisation ont pour objet de définir les modalités de mise à disposition du site TrackFlow et de ses services associés, et de définir les conditions d'utilisation de ces services par l'Utilisateur.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Accès aux services</h2>
            <p>Le service est accessible gratuitement à tout Utilisateur disposant d'un accès à internet. L'accès à certaines fonctionnalités (suivi de colis, notifications Discord) nécessite la création d'un compte utilisateur via l'authentification Discord.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Responsabilité de l'Utilisateur</h2>
            <p>L'Utilisateur s'engage à utiliser le service de manière loyale, dans le respect de ses présentes conditions et des lois et règlements applicables. Il est seul responsable de l'utilisation qu'il fait des informations et numéros de suivi qu'il renseigne sur la plateforme.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Évolution des CGU</h2>
            <p>TrackFlow se réserve le droit de modifier unilatéralement et à tout moment le contenu des présentes CGU. L'Utilisateur est invité à les consulter régulièrement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Droit applicable</h2>
            <p>Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation et/ou à leur exécution relève des juridictions françaises.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
