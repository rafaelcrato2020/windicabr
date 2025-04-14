-- Função para executar SQL dinâmico
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
EXECUTE sql_query;
END;
$$;
