export async function onRequestGet(context) {
  const { PASSWORD_KV } = context.env;
  if (!PASSWORD_KV)
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  const data = await PASSWORD_KV.get("vault_data");
  return new Response(data || JSON.stringify([]), {
    headers: { "Content-Type": "application/json" },
  });
}
export async function onRequestPost(context) {
  const { PASSWORD_KV, UPLOAD_PASSWORD } = context.env;
  if (!PASSWORD_KV)
    return new Response(JSON.stringify({ error: "KV未绑定" }), { status: 500 });
  if (!UPLOAD_PASSWORD)
    return new Response(
      JSON.stringify({
        error: "服务器未配置环境变量 UPLOAD_PASSWORD，拒绝任何修改操作以防篡改",
      }),
      { status: 403 },
    );

  try {
    const body = await context.request.json();
    const { password, data } = body;

    if (password !== UPLOAD_PASSWORD)
      return new Response(JSON.stringify({ error: "管理员密码错误" }), {
        status: 401,
      });

    const oldData = await PASSWORD_KV.get("vault_data");
    if (oldData) {
      await PASSWORD_KV.put("vault_data_backup", oldData);
    }

    await PASSWORD_KV.put("vault_data", JSON.stringify(data));
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
