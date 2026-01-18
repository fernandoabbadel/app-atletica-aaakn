"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Search, Heart, MessageCircle, MoreHorizontal, Plus, Flame, 
  Image as ImageIcon, ShieldCheck, Pin, X, Loader2, AlertTriangle, Send, Trash2, Flag,
  Crown, Star, Medal, Ghost, Lock
} from "lucide-react";
import Link from "next/link";
import { db, storage } from "../../lib/firebase";
import { 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, 
  updateDoc, doc, arrayUnion, arrayRemove, limit, getDocs 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// Kit de Emergência
const MODALIDADES_PADRAO = ["Futebol", "Vôlei", "Handebol", "Basquete", "Tênis de Mesa", "Natação", "Bateria", "Cheerleading"];

const UserBadges = ({ tier, badges }: { tier?: string, badges?: string[] }) => (
    <div className="flex items-center gap-1 ml-1">
        {tier === 'lenda' && <Crown size={10} className="text-yellow-500 fill-yellow-500"/>}
        {tier === 'atleta' && <Star size={10} className="text-purple-500 fill-purple-500"/>}
        {tier === 'bicho' && <Ghost size={10} className="text-zinc-400 fill-zinc-400"/>}
        {badges?.includes('fidelidade') && <Medal size={10} className="text-emerald-500"/>}
    </div>
);

export default function ComunidadePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState("Geral");
  const [activeFilter, setActiveFilter] = useState<"recent" | "likes" | "comments" | "hype">("recent");
  const [modalidades, setModalidades] = useState<string[]>(["Geral"]);
  const [posts, setPosts] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  const [newPostText, setNewPostText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const [reportModal, setReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [otherReasonText, setOtherReasonText] = useState("");
  
  const [commentModal, setCommentModal] = useState<string | null>(null);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // 1. Configs
  useEffect(() => {
    onSnapshot(doc(db, "app_config", "comunidade"), (snap) => { if (snap.exists()) setConfig(snap.data()); });
    
    const fetchModalidades = async () => {
        try {
            const q = query(collection(db, "modalidades"));
            const snap = await getDocs(q);
            const mods = snap.docs.map(d => d.data().nome);
            if (mods.length > 0) setModalidades(["Geral", ...mods]);
            else setModalidades(["Geral", ...MODALIDADES_PADRAO]);
        } catch (e) { 
            setModalidades(["Geral", ...MODALIDADES_PADRAO]);
        }
    };
    fetchModalidades();
  }, []);

  // 2. Posts
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      if (!user?.role?.includes('admin')) {
          data = data.filter(p => !p.blocked); 
      }
      if (activeTab !== "Geral") data = data.filter(p => p.categoria === activeTab);
      if (activeFilter === 'likes') data.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      if (activeFilter === 'comments') data.sort((a, b) => (b.comentarios || 0) - (a.comentarios || 0));
      if (activeFilter === 'hype') data.sort((a, b) => (b.hype?.length || 0) - (a.hype?.length || 0));
      setPosts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeTab, activeFilter, user]);

  // 3. Comentários
  useEffect(() => {
      if (!commentModal) return;
      const q = query(collection(db, `posts/${commentModal}/comments`), orderBy("createdAt", "asc"));
      const unsub = onSnapshot(q, (snap) => {
          setCommentsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
  }, [commentModal]);

  const handlePublish = async () => {
    if (!user) return addToast("Faça login!", "error");
    if (!newPostText.trim() && !imageFile) return;
    
    const isTreinador = user.role?.includes("treinador") || user.role?.includes("admin");
    if (activeTab !== "Geral" && !isTreinador) return addToast("Só o mestre posta aqui! 🏋️‍♂️", "info");

    setIsPublishing(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const storageRef = ref(storage, `posts/${Date.now()}_${user.uid}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        userName: user.nome || "Anônimo",
        handle: user.apelido ? `@${user.apelido}` : "@atleta",
        avatar: user.foto || "https://github.com/shadcn.png",
        texto: newPostText,
        imagem: imageUrl,
        likes: [],
        hype: [],
        comentarios: 0,
        denunciasCount: 0,
        categoria: activeTab,
        isTreinador: isTreinador,
        blocked: false,
        commentsDisabled: false,
        createdAt: serverTimestamp(),
      });

      setNewPostText("");
      setImageFile(null);
      addToast("Postado! 🦈", "success");
    } catch (e) { addToast("Erro ao postar.", "error"); }
    finally { setIsPublishing(false); }
  };

  // 🦈 CORREÇÃO: GUARD CLAUSE PARA EVITAR ERRO DE TYPE
  const handleReport = async () => {
      if (!user) {
          addToast("Faça login para denunciar.", "error");
          return;
      }

      if (!reportReason) return addToast("Selecione um motivo!", "error");
      
      const finalReason = reportReason === "Outros" ? `Outros: ${otherReasonText}` : reportReason;
      const postAlvo = posts.find(p => p.id === reportModal);
      const textoSalvo = postAlvo ? postAlvo.texto : "Conteúdo não carregado/imagem";

      await addDoc(collection(db, "denuncias"), {
          postId: reportModal,
          postText: textoSalvo,
          reporterId: user.uid,
          reason: finalReason,
          timestamp: serverTimestamp(),
          status: "pendente"
      });

      if (postAlvo) {
        await updateDoc(doc(db, "posts", reportModal!), {
            denunciasCount: (postAlvo.denunciasCount || 0) + 1
        });
      }

      addToast("Denúncia enviada. 👮‍♂️", "success");
      setReportModal(null);
      setReportReason("");
      setOtherReasonText("");
  };

  // 🦈 CORREÇÃO: GUARD CLAUSE PARA COMENTÁRIOS
  const handleComment = async () => {
      if (!user) {
          addToast("Faça login para comentar.", "error");
          return;
      }

      if (!newComment.trim()) return;
      try {
          await addDoc(collection(db, `posts/${commentModal}/comments`), {
              userId: user.uid,
              userName: user.nome || "Anônimo",
              avatar: user.foto || "/logo.png",
              texto: newComment,
              tier: user.plano_badge ? user.plano_badge.toLowerCase().split(' ')[0] : 'standard',
              createdAt: serverTimestamp()
          });
          await updateDoc(doc(db, "posts", commentModal!), { comentarios: commentsList.length + 1 });
          setNewComment("");
      } catch (e) { console.error(e); }
  };

  const toggleAction = async (postId: string, field: "likes" | "hype", list: string[]) => {
    if (!user) return;
    const postRef = doc(db, "posts", postId);
    const hasInteracted = list.includes(user.uid);
    try {
      await updateDoc(postRef, { [field]: hasInteracted ? arrayRemove(user.uid) : arrayUnion(user.uid) });
    } catch (e) { console.error(e); }
  };

  const currentPostCommentsDisabled = posts.find(p => p.id === commentModal)?.commentsDisabled;

  // ... (RESTANTE DO JSX MANTIDO IGUAL - COPIAR ABAIXO PARA FINALIZAR O ARQUIVO)
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24">
      {/* CAPA & HEADER */}
      <div className="h-48 w-full relative overflow-hidden group">
          <img src={config.capaUrl || "/carteirinha-bg.jpg"} className="w-full h-full object-cover opacity-40 blur-sm scale-110 group-hover:scale-100 transition duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
          <div className="absolute top-4 left-4 z-20"><Link href="/dashboard" className="p-2 bg-black/50 rounded-full text-white hover:bg-emerald-500 hover:text-black transition"><ArrowLeft size={24}/></Link></div>
          <div className="absolute bottom-4 left-6 z-20">
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">{config.titulo || "Resenha Tubarão"}</h1>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{config.subtitulo || "Onde o cardume se encontra"}</p>
          </div>
      </div>

      {/* ABAS DINÂMICAS */}
      <div className="sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-md border-b border-zinc-900 overflow-x-auto custom-scrollbar">
          <div className="flex gap-2 p-3 min-w-max">
              {modalidades.map(mod => (
                  <button key={mod} onClick={() => setActiveTab(mod)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border ${activeTab === mod ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>{mod}</button>
              ))}
          </div>
      </div>

      {/* FILTROS */}
      <div className="flex justify-around border-b border-zinc-900 bg-zinc-900/30 p-2 text-[10px] uppercase font-bold text-zinc-500">
          <button onClick={() => setActiveFilter('recent')} className={`flex items-center gap-1 hover:text-white ${activeFilter === 'recent' ? 'text-emerald-500' : ''}`}>Recentes</button>
          <button onClick={() => setActiveFilter('likes')} className={`flex items-center gap-1 hover:text-white ${activeFilter === 'likes' ? 'text-red-500' : ''}`}>Em Alta</button>
          <button onClick={() => setActiveFilter('comments')} className={`flex items-center gap-1 hover:text-white ${activeFilter === 'comments' ? 'text-blue-500' : ''}`}>Polêmicos</button>
          <button onClick={() => setActiveFilter('hype')} className={`flex items-center gap-1 hover:text-white ${activeFilter === 'hype' ? 'text-orange-500' : ''}`}>Hypados</button>
      </div>

      <main className="max-w-2xl mx-auto">
        {/* POSTAR */}
        {(activeTab === "Geral" || user?.role?.includes("treinador")) && (
            <div className="p-4 border-b border-zinc-900 bg-zinc-900/20">
                <div className="flex gap-3">
                    <img src={user?.foto || "https://github.com/shadcn.png"} className="w-10 h-10 rounded-full shrink-0 object-cover" />
                    <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder={`Mandar um salve na aba ${activeTab}...`} className="bg-transparent flex-1 resize-none text-sm outline-none pt-2 placeholder:text-zinc-600"/>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <label className="p-2 hover:bg-zinc-800 rounded-full cursor-pointer text-emerald-500"><ImageIcon size={20}/><input type="file" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)}/></label>
                    <button onClick={handlePublish} disabled={isPublishing} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-black uppercase text-xs transition">{isPublishing ? <Loader2 className="animate-spin" size={14}/> : "Publicar"}</button>
                </div>
            </div>
        )}

        {/* FEED */}
        <div className="divide-y divide-zinc-900">
            {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40}/></div> : posts.map(post => (
                <div key={post.id} className={`p-4 hover:bg-zinc-900/10 transition group relative ${post.blocked ? 'opacity-50 grayscale' : ''}`}>
                    
                    {post.blocked && <div className="bg-red-500/10 text-red-500 text-[10px] font-bold uppercase px-2 py-1 mb-2 rounded border border-red-500/20 inline-block">🚫 Post Bloqueado (Admin)</div>}

                    <div className="flex gap-3">
                        <Link href={`/perfil/${post.userId}`}><img src={post.avatar} className="w-10 h-10 rounded-full border border-zinc-800 object-cover" /></Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Link href={`/perfil/${post.userId}`} className="flex items-center gap-1 font-bold text-sm hover:text-emerald-400 transition">
                                        {post.userName} {post.isTreinador && <ShieldCheck size={12} className="text-yellow-500"/>}
                                    </Link>
                                    <p className="text-[10px] text-zinc-500">{post.handle}</p>
                                </div>
                                <button onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)} className="text-zinc-600 hover:text-white p-1"><MoreHorizontal size={16}/></button>
                                {menuOpen === post.id && (
                                    <div className="absolute right-4 top-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-10 overflow-hidden min-w-[140px]">
                                        {user?.role?.includes('admin') && <button onClick={() => updateDoc(doc(db, "posts", post.id), {fixado: !post.fixado})} className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-zinc-800 flex items-center gap-2"><Pin size={14}/> {post.fixado ? 'Desafixar' : 'Fixar'}</button>}
                                        <button onClick={() => {setReportModal(post.id); setMenuOpen(null)}} className="w-full text-left px-4 py-3 text-xs font-bold text-yellow-500 hover:bg-zinc-800 flex items-center gap-2"><Flag size={14}/> Denunciar</button>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-zinc-300 mt-2 whitespace-pre-line leading-relaxed">{post.texto}</p>
                            {post.imagem && <img src={post.imagem} className="mt-3 rounded-xl border border-zinc-800 w-full max-h-96 object-cover" />}
                            
                            <div className="flex justify-between mt-4 max-w-xs text-zinc-500">
                                <button onClick={() => setCommentModal(post.id)} className="flex items-center gap-1.5 hover:text-blue-400 transition">
                                    <MessageCircle size={18}/> {post.comentarios || 0}
                                    {post.commentsDisabled && <Lock size={12} className="text-red-500 ml-1"/>}
                                </button>
                                <button onClick={() => toggleAction(post.id, "likes", post.likes || [])} className={`flex items-center gap-1.5 transition ${post.likes?.includes(user?.uid) ? 'text-red-500' : 'hover:text-red-500'}`}><Heart size={18} className={post.likes?.includes(user?.uid) ? "fill-red-500" : ""} /> {post.likes?.length || 0}</button>
                                <div className="group relative">
                                    <button onClick={() => toggleAction(post.id, "hype", post.hype || [])} className={`flex items-center gap-1.5 transition ${post.hype?.includes(user?.uid) ? 'text-orange-500' : 'hover:text-orange-500'}`}>
                                        <Flame size={18} className={post.hype?.includes(user?.uid) ? "fill-orange-500" : ""}/> <span className="text-[10px]">{post.hype?.length || 0}</span>
                                    </button>
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-orange-500 text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">Dar um Hype!</span>
                                </div>
                                <div className="flex items-center gap-1 text-blue-500/50 cursor-default" title="Denúncias"><Flag size={16} className={post.denunciasCount > 0 ? "fill-blue-900 text-blue-500" : ""}/> {post.denunciasCount > 0 && <span className="text-[10px]">{post.denunciasCount}</span>}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </main>

      {/* MODAL COMENTÁRIOS */}
      {commentModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setCommentModal(null)}>
              <div className="bg-zinc-900 w-full max-w-md h-[80vh] sm:rounded-3xl rounded-t-3xl border border-zinc-800 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 sm:rounded-t-3xl">
                      <h3 className="font-bold text-white flex items-center gap-2">Comentários {currentPostCommentsDisabled && <Lock size={14} className="text-red-500"/>}</h3>
                      <button onClick={() => setCommentModal(null)}><X size={20} className="text-zinc-500"/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      {commentsList.length === 0 && <p className="text-center text-zinc-600 text-xs py-10">Nenhum comentário ainda.</p>}
                      {commentsList.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                              <Link href={`/perfil/${comment.userId}`}><img src={comment.avatar} className="w-8 h-8 rounded-full object-cover border border-zinc-700"/></Link>
                              <div className="bg-zinc-800/50 p-3 rounded-2xl rounded-tl-none border border-zinc-800/50">
                                  <div className="flex items-center gap-2">
                                      <Link href={`/perfil/${comment.userId}`} className="text-xs font-bold text-white hover:underline">{comment.userName}</Link>
                                      <UserBadges tier={comment.tier}/> 
                                  </div>
                                  <p className="text-xs text-zinc-300 mt-1">{comment.texto}</p>
                              </div>
                          </div>
                      ))}
                  </div>
                  {!currentPostCommentsDisabled ? (
                      <div className="p-3 border-t border-zinc-800 bg-black flex gap-2 sm:rounded-b-3xl">
                          <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Escreva..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 text-sm text-white outline-none focus:border-emerald-500" onKeyDown={e => e.key === 'Enter' && handleComment()}/>
                          <button onClick={handleComment} disabled={!newComment.trim()} className="bg-emerald-600 p-2.5 rounded-full text-white disabled:opacity-50"><Send size={18}/></button>
                      </div>
                  ) : (
                      <div className="p-4 bg-red-900/20 text-red-500 text-xs font-bold text-center border-t border-red-900/30">
                          <Lock size={14} className="inline mr-2"/> Comentários desativados pela moderação.
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* MODAL DENÚNCIA */}
      {reportModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4" onClick={() => setReportModal(null)}>
              <div className="bg-zinc-900 w-full max-w-sm p-6 rounded-3xl border border-zinc-800 space-y-4" onClick={e => e.stopPropagation()}>
                  <div className="text-center">
                      <AlertTriangle size={40} className="text-red-500 mx-auto mb-2"/>
                      <h3 className="font-black uppercase text-lg">Reportar Abuso</h3>
                  </div>
                  <div className="space-y-2">
                      {["Conteúdo Ofensivo", "Spam / Propaganda", "Fake News", "Assédio", "Outros"].map(reason => (
                          <button key={reason} onClick={() => setReportReason(reason)} className={`w-full p-3 rounded-xl text-xs font-bold text-left border transition ${reportReason === reason ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>{reason}</button>
                      ))}
                      {reportReason === "Outros" && (
                          <input type="text" maxLength={50} placeholder="Descreva (max 50 chars)..." className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500" value={otherReasonText} onChange={e => setOtherReasonText(e.target.value)}/>
                      )}
                  </div>
                  <button onClick={handleReport} className="w-full bg-red-600 py-3 rounded-xl font-black uppercase text-xs hover:bg-red-500 transition">Enviar Denúncia</button>
              </div>
          </div>
      )}
    </div>
  );
}