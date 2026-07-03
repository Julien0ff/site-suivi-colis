import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Mentions Légales - TrackFlow",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <FileText className="h-8 w-8 text-neon-blue" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Mentions Légales</h1>
          <p className="text-sm text-muted-foreground">En vigueur au {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Éditeur du site</h2>
            <p>Le site TrackFlow (accessible à l'adresse trackflow.thefoxy.me) est un projet personnel/Open Source sous licence GPL-3.0.</p>
            <p>Développeur : Julien (TheFoxy)</p>
            <p>Email de contact : ruebudu69@gmail.com</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Hébergement</h2>
            <p>Le site est hébergé par la société Vercel Inc.</p>
            <p>Adresse : 340 S Lemon Ave #4133 Walnut, CA 91789, USA</p>
            <p>Site Web : https://vercel.com</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Propriété intellectuelle</h2>
            <p>Le code source du site TrackFlow est disponible sous licence Libre (GPL-3.0). Les marques et logos des transporteurs (La Poste, Amazon, etc.) présents sur ce site appartiennent à leurs propriétaires respectifs et sont utilisés uniquement à des fins d'identification.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Limitation de responsabilité</h2>
            <p>L'éditeur ne saurait être tenu pour responsable des erreurs de suivi ou des retards dans la mise à jour des statuts des colis, ces informations provenant d'APIs tierces externes (AfterShip, TrackingMore).</p>
          </section>
        </div>
      </div>
    </div>
  );
}
