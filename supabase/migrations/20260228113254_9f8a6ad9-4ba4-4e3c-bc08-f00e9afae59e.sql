-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  razao_social TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  telefones TEXT DEFAULT '',
  email TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read clientes" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Public insert clientes" ON public.clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update clientes" ON public.clientes FOR UPDATE USING (true);
CREATE POLICY "Public delete clientes" ON public.clientes FOR DELETE USING (true);

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Obras
CREATE TABLE public.obras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  referencia TEXT DEFAULT '',
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  endereco TEXT DEFAULT '',
  bairro TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'em_andamento',
  data_inicio TEXT DEFAULT '',
  previsao_termino TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read obras" ON public.obras FOR SELECT USING (true);
CREATE POLICY "Public insert obras" ON public.obras FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update obras" ON public.obras FOR UPDATE USING (true);
CREATE POLICY "Public delete obras" ON public.obras FOR DELETE USING (true);

CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON public.obras
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Equipe
CREATE TABLE public.equipe (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cargo TEXT DEFAULT '',
  formacao TEXT DEFAULT '',
  crea TEXT DEFAULT '',
  assinatura_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.equipe ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read equipe" ON public.equipe FOR SELECT USING (true);
CREATE POLICY "Public insert equipe" ON public.equipe FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update equipe" ON public.equipe FOR UPDATE USING (true);
CREATE POLICY "Public delete equipe" ON public.equipe FOR DELETE USING (true);

CREATE TRIGGER update_equipe_updated_at BEFORE UPDATE ON public.equipe
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Laudos
CREATE TABLE public.laudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  endereco_imovel_vistoriado TEXT DEFAULT '',
  tipo_imovel TEXT DEFAULT '',
  objetivo TEXT DEFAULT '',
  tipo_ocupacao TEXT DEFAULT '',
  vias_acesso TEXT DEFAULT '',
  caracteristicas JSONB DEFAULT '{}',
  equipe_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  figura_localizacao TEXT DEFAULT '',
  figura_fluxograma TEXT DEFAULT '',
  fotos JSONB DEFAULT '[]',
  avaliacao_final TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'rascunho',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.laudos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read laudos" ON public.laudos FOR SELECT USING (true);
CREATE POLICY "Public insert laudos" ON public.laudos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update laudos" ON public.laudos FOR UPDATE USING (true);
CREATE POLICY "Public delete laudos" ON public.laudos FOR DELETE USING (true);

CREATE TRIGGER update_laudos_updated_at BEFORE UPDATE ON public.laudos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for laudo images
INSERT INTO storage.buckets (id, name, public) VALUES ('laudo-images', 'laudo-images', true);

CREATE POLICY "Public read laudo images" ON storage.objects FOR SELECT USING (bucket_id = 'laudo-images');
CREATE POLICY "Public insert laudo images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'laudo-images');
CREATE POLICY "Public update laudo images" ON storage.objects FOR UPDATE USING (bucket_id = 'laudo-images');
CREATE POLICY "Public delete laudo images" ON storage.objects FOR DELETE USING (bucket_id = 'laudo-images');