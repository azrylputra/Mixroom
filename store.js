/* Mixroom shared data layer — Supabase-backed CMS.
   Requires the Supabase UMD script loaded before this file:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
*/
(function(){
  "use strict";
  var SUPABASE_URL = "https://xbicggwtzvpxihttukxk.supabase.co";
  var SUPABASE_KEY = "sb_publishable_1P-e67Tlshcz5vO-ZCL4TA_4WAv_da2";

  var sb = null;
  try{ if(window.supabase && window.supabase.createClient){ sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } }catch(e){}

  function need(){ if(!sb) throw new Error("Supabase client not loaded"); return sb; }

  // ---- format helpers shared by public pages ----
  function fmtDate(iso){
    try{ return new Date(iso).toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"}).toUpperCase(); }
    catch(e){ return ""; }
  }
  function fmtDiscount(v){
    if(v==null || v==="") return "";
    var s=String(v).trim();
    if(!s) return "";
    return "-" + s.replace(/^-/,"");
  }

  window.MixDB = {
    ready: !!sb,
    client: sb,
    fmtDate: fmtDate,
    fmtDiscount: fmtDiscount,

    // ---------- PROGRAMS ----------
    programs: async function(){
      var r = await need().from("programs").select("*").order("created_at",{ascending:false});
      if(r.error) throw r.error; return r.data || [];
    },
    addProgram: async function(p){
      var r = await need().from("programs").insert({
        title:p.title, category:p.category, level:p.level,
        price:p.price, discount_type:p.discount_type, discount_value:p.discount_value,
        mentor:p.mentor, max_students:p.max_students, image:p.image
      }).select().single();
      if(r.error) throw r.error; return r.data;
    },
    updateProgram: async function(id,patch){
      var r = await need().from("programs").update(patch).eq("id",id).select().single();
      if(r.error) throw r.error; return r.data;
    },
    delProgram: async function(id){
      var r = await need().from("programs").delete().eq("id",id);
      if(r.error) throw r.error;
    },

    // ---------- BLOGS ----------
    blogs: async function(){
      var r = await need().from("blogs").select("*").order("created_at",{ascending:false});
      if(r.error) throw r.error; return r.data || [];
    },
    blog: async function(id){
      var r = await need().from("blogs").select("*").eq("id",id).maybeSingle();
      if(r.error) throw r.error; return r.data;
    },
    addBlog: async function(b){
      var r = await need().from("blogs").insert({
        title:b.title, author:b.author, category:b.category,
        description:b.description, image:b.image
      }).select().single();
      if(r.error) throw r.error; return r.data;
    },
    updateBlog: async function(id,patch){
      var r = await need().from("blogs").update(patch).eq("id",id).select().single();
      if(r.error) throw r.error; return r.data;
    },
    delBlog: async function(id){
      var r = await need().from("blogs").delete().eq("id",id);
      if(r.error) throw r.error;
    }
  };
})();
