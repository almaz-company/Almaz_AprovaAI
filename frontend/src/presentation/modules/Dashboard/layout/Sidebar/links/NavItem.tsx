
import { Car, ChartBar, Users } from "lucide-react";
import { NavItem } from "../types";

export const navItems: NavItem[] = [
  {
    icon: <ChartBar />,
    name: "Painel Administrativo",
    subItems: [{ name: "Visao Geral", path: "/visao-geral", pro: false },],
  },
  {
    name: "Automação",
    icon: <Users />,
    subItems: [
      { name: 
        "Clientes", 
        path: "/clientes", 
        pro: false 
      },
      { name: 
        "Posts", 
        path: "/posts", 
        pro: false 
      },
      { name: 
        "Criar Post", 
        path: "/upload", 
        pro: false 
      },
      { name: 
        "Calendario", 
        path: "/calendario", 
        pro: false 
      },
    ],
  },
];