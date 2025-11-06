
import { Car, ChartBar, Users } from "lucide-react";
import { NavItem } from "../types";

export const navItems: NavItem[] = [
  {
    icon: <ChartBar />,
    name: "Painel Administrativo",
    subItems: [
      { name: "Visao Geral", path: "/visao-geral", pro: false },
     
    ],
  },
  {
    name: "Clientes",
    icon: <Users />,
    subItems: [
      { name: 
        "Cadastro", 
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
        "Calendário ", 
        path: "/calendario", 
        pro: false 
      },
    ],
  },
];
