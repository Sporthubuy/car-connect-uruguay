import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Layout } from '@/components/layout/Layout';
import { Loader2, FileText } from 'lucide-react';

interface StaticPageProps {
  pageKey: string;
}

const StaticPage = ({ pageKey }: StaticPageProps) => {
  const titleKey = `page_${pageKey}_title`;
  const contentKey = `page_${pageKey}_content`;

  const settings = useQuery(api.settings.getSettings, {
    keys: [titleKey, contentKey],
  });

  const isLoading = settings === undefined;
  const title = settings?.[titleKey];
  const content = settings?.[contentKey];

  return (
    <Layout>
      <div className="container-wide py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : title && content ? (
            <>
              <h1 className="text-3xl font-bold text-foreground mb-8">
                {title}
              </h1>
              <div className="prose prose-neutral max-w-none">
                {content.split('\n').map((line, i) => (
                  line.trim() ? (
                    <p key={i} className="text-muted-foreground leading-relaxed">
                      {line}
                    </p>
                  ) : (
                    <br key={i} />
                  )
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Pagina en construccion
              </h2>
              <p className="text-muted-foreground">
                Esta pagina estara disponible proximamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StaticPage;
