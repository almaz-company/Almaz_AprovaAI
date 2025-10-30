
import { Car, ChartBar, Users } from "lucide-react";
import { NavItem } from "../types";

export const navItems: NavItem[] = [
  {
    icon: <ChartBar />,
    name: "Painel Administrativo",
    subItems: [{ name: "Visao Geral", path: "/visao-geral", pro: false },],
  },
  {
    name: "calendario Editoral",
    icon: <Car/>,
    subItems: [
      { 
        name: "Calendario", 
        path: "/calendario", 
        pro: 
        false }],
  },
  {
    name: "Gestão de Clientes",
    icon: <Users />,
    subItems: [
      { name: 
        "Gestão de Clientes", 
        path: "/clientes", 
        pro: false 
      },
      { name: 
        "Gestao de Posts", 
        path: "/posts", 
        pro: false 
      },
      { name: 
        "Criar Post", 
        path: "/upload", 
        pro: false 
      },
      
    ],
  },
];