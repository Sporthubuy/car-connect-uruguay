import { Component, ErrorInfo, ReactNode } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Layout>
          <div className="container-wide py-16 flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Algo salio mal
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              Ocurrio un error inesperado. Por favor, intenta recargar la pagina
              o vuelve al inicio.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted p-3 rounded-lg max-w-lg overflow-auto">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3">
              <Button onClick={this.handleReload} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar pagina
              </Button>
              <Button onClick={this.handleGoHome}>
                <Home className="h-4 w-4 mr-2" />
                Ir al inicio
              </Button>
            </div>
          </div>
        </Layout>
      );
    }

    return this.props.children;
  }
}
