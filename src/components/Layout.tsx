import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  User, 
  Settings, 
  BarChart3, 
  Users, 
  FileText,
  Shield,
  Target
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getNavigationItems = () => {
    if (!profile) return [];

    const items = [];

    if (profile.papel === 'admin') {
      items.push(
        { href: '/admin', label: 'Admin Studio', icon: Shield },
        { href: '/admin/questionarios', label: 'Questionários', icon: FileText },
        { href: '/admin/usuarios', label: 'Usuários', icon: Users },
        { href: '/admin/acoes-pdi', label: 'Ações PDI', icon: Target },
        { href: '/pdis', label: 'PDIs', icon: FileText }
      );
    } else if (profile.papel === 'gestor') {
      items.push(
        { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
        { href: '/avaliar', label: 'Avaliar Colaborador', icon: FileText },
        { href: '/colaboradores', label: 'Meus Colaboradores', icon: Users },
        { href: '/pdis', label: 'PDIs', icon: FileText }
      );
    } else {
      items.push(
        { href: '/colaborador', label: 'Meu Perfil', icon: User },
        { href: '/colaborador/avaliacoes', label: 'Minhas Avaliações', icon: BarChart3 },
        { href: '/pdis', label: 'Meus PDIs', icon: FileText }
      );
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
              <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                Vendas Pro - PDI
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.nome?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.nome}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {profile?.papel}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}