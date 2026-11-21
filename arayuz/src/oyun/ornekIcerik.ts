// Tarayıcı testinde (?test=1) kullanılan örnek oyun içeriği.
// Oyunun (hikaye_oyun) icerik/ klasöründen 2026-11-16'da kopyalandı (kişiler, kalabalık, sandık, görev ve sesler 2026-11-17'de yenilendi; nitelikler, gün-gece ve bir örnek günlük program 2026-11-22'de eklendi); harita kısaltıldı.
export const ORNEK_ICERIK: Record<string, any> = {
 "oyun.json": {
  "surum": 1,
  "ad": "Hikâye Oyunu",
  "not": "ÖRNEK İÇERİK: Ölçekler, sorular ve puanlar yalnızca sistemi denemek için yer tutucudur. Gerçek senaryolar ve psikolojiye dayalı puanlama Harun'dan gelecek.",
  "olcekler": [
   {
    "id": "ornek_a",
    "ad": "Örnek ölçek A",
    "aciklama": "Yer tutucu ölçek. Gerçek ölçek Harun'dan gelecek."
   },
   {
    "id": "ornek_b",
    "ad": "Örnek ölçek B",
    "aciklama": "Yer tutucu ölçek. Gerçek ölçek Harun'dan gelecek."
   },
   {
    "id": "ornek_c",
    "ad": "Örnek ölçek C",
    "aciklama": "Yer tutucu ölçek. Gerçek ölçek Harun'dan gelecek."
   }
  ],
  "haritalar": [
   {
    "dosya": "haritalar/deneme_yolu.json",
    "ad": "Deneme yolu",
    "aciklama": "Sade (plain) deneme haritası: yol, insanlar ve kapılar.",
    "durum": "hazir"
   },
   {
    "dosya": "",
    "ad": "Arkadaşlık",
    "aciklama": "Arkadaşlık ilişkileri üzerine harita.",
    "durum": "planli"
   },
   {
    "dosya": "",
    "ad": "İlişkiler",
    "aciklama": "Yakın ilişkiler üzerine harita.",
    "durum": "planli"
   },
   {
    "dosya": "",
    "ad": "Aile",
    "aciklama": "Aile ilişkileri üzerine harita.",
    "durum": "planli"
   },
   {
    "dosya": "",
    "ad": "İş ortamı",
    "aciklama": "İş hayatı üzerine harita.",
    "durum": "planli"
   }
  ],
  "karakter_olusturma": "karakter_olusturma.json"
 },
 "karakterler.json": {
  "surum": 1,
  "not": "Unreal'de karakterlerin görünüşü (MetaHuman), hareketleri ve oyuncunun 'his' ayarları. Yollar Unreal içerik yollarıdır (/Game/...). Hızlar cm/sn, açılar derece.",
  "oyuncu": {
   "unreal_govde": "/Game/MetaHumans/Deneme_Erkek/BP_Deneme_Erkek",
   "unreal_hareket": "/Game/Animasyonlar/BS_Yuruyus",
   "unreal_hiz_carpani": 1.0,
   "hareket": {
    "yurume_hizi": 150,
    "kosma_hizi": 400,
    "geri_orani": 0.55,
    "hizlanma": 700,
    "yavaslama": 1100,
    "donus_hizi": 140,
    "donus_ivmesi": 700,
    "kamera_gore_kontrol": 1,
    "serbest_donus_hizi": 450,
    "serbest_donus_cevikligi": 8,
    "serbest_donus_ivmesi": 2400,
    "yavas_yurume_hizi": 90,
    "comelme_hizi": 100,
    "gard_hizi": 100,
    "saldiri_hizi": 70,
    "ziplama_hizi": 420,
    "havada_kontrol": 0.25,
    "kacinma_mesafesi_ileri": 150,
    "kacinma_mesafesi_geri": 60,
    "kacinma_mesafesi_yan": 50,
    "kacinma_suresi_ileri": 0.45,
    "kacinma_suresi_geri": 0.4,
    "kacinma_suresi_yan": 0.35
   },
   "kamera": {
    "fare_hassasiyeti": 0.15,
    "bakis_siniri": 80,
    "gorus_acisi": 80,
    "bas_sallantisi": 1.0,
    "ucuncu_kisi_mesafe": 320,
    "en_yakin": 120,
    "en_uzak": 900,
    "takip_yumusakligi": 14,
    "yukseklik": 60,
    "tus_ile_donus_hizi": 120,
    "donus_yumusakligi": 20,
    "otomatik_takip": 0,
    "otomatik_takip_gecikmesi": 1.5,
    "otomatik_takip_hizi": 1.5
   },
   "animasyon": {
    "gecis_hizi": 7,
    "donerken_adim": 0.5
   },
   "unreal_anim_sinifi": "/Game/Animasyonlar/ABP_Oyuncu",
   "dovus": {
    "guclu_yumruk_basili_sure": 0.35,
    "kombo_acilisi": 0.45
   },
   "animasyon_yuvalari": {
    "tam_govde": "DefaultSlot",
    "ust_govde": "UstGovde"
   },
   "animasyonlar": {
    "ziplama": "/Game/Animasyonlar/A_Ziplama",
    "havada": "/Game/Animasyonlar/A_Havada",
    "inis": "/Game/Animasyonlar/A_Inis",
    "yumruk_1": "/Game/Animasyonlar/A_Yumruk4",
    "yumruk_2": "/Game/Animasyonlar/A_Yumruk5",
    "yumruk_3": "/Game/Animasyonlar/A_Yumruk6",
    "guclu_yumruk": "/Game/Animasyonlar/A_GucluYumruk1",
    "gard": "/Game/Animasyonlar/A_Gard1",
    "kacinma_ileri": "/Game/Animasyonlar/A_KacinmaIleri",
    "kacinma_geri": "/Game/Animasyonlar/A_KacinmaGeri",
    "kacinma_sol": "",
    "kacinma_sag": "",
    "donus_sol": "/Game/Animasyonlar/A_DonusSol1",
    "donus_sag": "/Game/Animasyonlar/A_DonusSag1",
    "esya_alma": "",
    "cantaya_koyma": "",
    "kapi_acma": "",
    "konusma": "",
    "konusma_jest": "",
    "kapi_kapama": ""
   },
   "dogallik": {
    "bas_onculugu": 0.3,
    "en_fazla_burulma": 50,
    "bel_payi": 0.2,
    "gogus_payi": 0.3,
    "bas_payi": 0.5,
    "yana_yatma": 0.06,
    "en_fazla_yatma": 8,
    "ivme_egilmesi": 0.004,
    "kacinma_yatma": 12,
    "uzanma_egilmesi": 0.6,
    "uzanma_egilme_isareti": 1
   },
   "etkilesim": {
    "tutma_ani": 0.45,
    "cantaya_birakma_ani": 0.55,
    "kapi_itme_ani": 0.45,
    "kapi_kapama_ani": 0.45
   },
   "canta": {
    "goster": 0,
    "konum": [
     -4,
     24,
     2
    ],
    "boyut": [
     24,
     9,
     20
    ],
    "renk": "#2a170c"
   },
   "nitelikler": {
    "not": "Can ve dayanıklılık. Koşma/kaçınma/vuruş/zıplama dayanıklılık harcar; darbe can azaltır. Can biterse ölüm yok: bayılır, bayilma_suresi kadar yatar, can kalkis_can_orani kadar dolup kalkar.",
    "can": 100,
    "dayaniklilik": 100,
    "can_yenilenme": 2,
    "can_yenilenme_gecikmesi": 8,
    "dayaniklilik_yenilenme": 26,
    "dayaniklilik_gecikmesi": 0.9,
    "tukenme_esigi": 0.3,
    "kosu_tuketimi": 14,
    "kacinma_bedeli": 22,
    "yumruk_bedeli": 7,
    "guclu_vurus_bedeli": 16,
    "tekme_bedeli": 12,
    "ziplama_bedeli": 8,
    "engel_bedeli": 10,
    "hafif_darbe": 8,
    "guclu_darbe": 20,
    "blok_hasar_carpani": 0.15,
    "blok_dayaniklilik": 10,
    "bayilma_suresi": 4,
    "kalkis_can_orani": 0.35
   }
  },
  "kisiler": {
   "yolcu": {
    "unreal_govde": "/Game/MetaHumans/Kisi_Erkek/BP_Kisi_Erkek"
   },
   "bekleyen": {
    "unreal_govde": "/Game/MetaHumans/Kisi_Kadin/BP_Kisi_Kadin"
   },
   "gezgin_1": {
    "unreal_govde": "/Game/MetaHumans/Kisi_Yasli/BP_Kisi_Yasli"
   },
   "gezgin_2": {
    "unreal_govde": "/Game/MetaHumans/Kisi_Kadin/BP_Kisi_Kadin"
   }
  },
  "kisi_nitelikler": {
   "not": "Kişilerin (NPC) canı. Hafif darbe can azaltır (başa 1.25 kat); can biterse kişi yere düşer, kalkınca kalkis_can_orani kadar dolar. Güçlü darbe her zaman düşürür. Haritadaki kişide \"nitelikler\" varsa onun değerleri bunların üstüne yazılır.",
   "can": 60,
   "hafif_darbe": 12,
   "guclu_darbe": 30,
   "blok_hasar_carpani": 0.15,
   "can_yenilenme": 2,
   "can_yenilenme_gecikmesi": 8,
   "kalkis_can_orani": 0.5
  }
 },
 "haritalar/deneme_yolu.json": {
  "surum": 1,
  "id": "deneme_yolu",
  "ad": "Deneme yolu",
  "tema": "Gerçekçi deneme",
  "not": "ÖRNEK harita: sistemi denemek için. Gerçek temalı haritalar (Arkadaşlık, Aile...) ileride.",
  "ortam": {
   "gokyuzu_ust": "#5b8fd6",
   "ufuk": "#cfe0ee",
   "zemin_rengi": "#6f9a52",
   "gunes_yonu": [
    -38,
    -30
   ],
   "gunes_gucu": 1.6,
   "sis": 0.004,
   "ortam_isigi": 0.6,
   "gokyuzu_hdri": "varliklar/gokyuzu/kloofendal_48d_partly_cloudy_puresky.hdr",
   "doygunluk": 1.05,
   "zemin_malzemesi": {
    "doku": "varliklar/dokular/grass004",
    "olcek": 0.35
   },
   "zaman": {
    "not": "Gün-gece döngüsü. gun_suresi_dakika: gerçek dakikada bir oyun günü (24 saat). ogle_yonu: öğlen güneşin geldiği yön (Godot derece). gece_gucu: ay ışığı, güneşin oranı. gece_pozlama: gece otomatik pozlama sapmasi (eksi karanlik), gece_gok_isigi: gece gok isigi orani (2026-11-20: gece de etraf gorunsun).",
    "baslangic_saati": 10,
    "gun_suresi_dakika": 48,
    "en_yuksek_gunes": 58,
    "ogle_yonu": -30,
    "gece_gucu": 0.22,
    "gece_pozlama": -0.85,
    "gece_gok_isigi": 0.28
   },
   "pozlama": {
    "golge_kontrasti": 0.8,
    "parlak_kontrasti": 0.85
   }
  },
  "yol": {
   "uzunluk": 130,
   "genislik": 7,
   "renk": "#8d8478",
   "kenar_rengi": "#b9b2a4",
   "malzeme": {
    "doku": "varliklar/dokular/asphalt_02",
    "olcek": 0.2
   },
   "kenar_malzemesi": {
    "doku": "varliklar/dokular/rocky_trail",
    "olcek": 0.5
   },
   "serit": true
  },
  "baslangic": {
   "konum": [
    0,
    0,
    4
   ],
   "aci": 0
  },
  "bitis": {
   "z": -118,
   "metin": "Yolun sonuna geldin."
  },
  "npcler": [
   {
    "id": "yolcu",
    "ad": "Yolcu",
    "gorunum": {
     "tur": "mh",
     "cinsiyet": "erkek",
     "yas_yil": 34,
     "boy_cm": 181,
     "kilo_kg": 84,
     "ten": "caucasian",
     "sac": "elvs_short_side_do",
     "sac_rengi": "#5a3d27",
     "sakal": "wdg_scruffy_beard",
     "sakal_rengi": "#5a3d27",
     "ust": "toigo_fisherman_sweater",
     "alt": "elvs_jeans_straight_leg",
     "ayakkabi": "toigo_ankle_boots_male",
     "goz": "green",
     "kas": "eyebrow005",
     "ayarlar": {
      "kas": 0.3,
      "omuz": 0.3,
      "cene_genislik": 0.4,
      "burun_boyut": 0.2
     }
    },
    "alan": {
     "merkez": [
      2,
      -18
     ],
     "yaricap": 7
    },
    "hiz": 1.23,
    "diyalog": "diyaloglar/yolcu.json",
    "selamlar": [
     "Merhaba!",
     "Güzel bir gün, değil mi?"
    ],
    "selamlasma": "tokalas",
    "tepkiler": {
     "carpma": [
      "Dikkat et!",
      "Hey, önüne bak!"
     ],
     "itilme": [
      "Ne yapıyorsun?!",
      "Bana dokunma!"
     ],
     "vurulma": [
      "Ah!",
      "Delirdin mi?!"
     ]
    }
   },
   {
    "id": "bekleyen",
    "ad": "Bekleyen kişi",
    "gorunum": {
     "tur": "mh",
     "cinsiyet": "kadin",
     "yas_yil": 29,
     "boy_cm": 170,
     "kilo_kg": 60,
     "ten": "african",
     "sac": "elvs_micky_afro",
     "sac_rengi": "#0f0c0b",
     "ust": "toigo_keyhole_tank_top",
     "alt": "elvs_gored_midi_skirt",
     "ayakkabi": "dressupdoc_sandals1",
     "goz": "brown",
     "kas": "eyebrow008",
     "kirpik": "eyelashes03",
     "ayarlar": {
      "bel": -0.3,
      "kalca": 0.3,
      "dudak": 0.4,
      "cene_genislik": -0.3
     }
    },
    "alan": {
     "merkez": [
      -2,
      -62
     ],
     "yaricap": 6
    },
    "hiz": 0.95,
    "diyalog": "diyaloglar/bekleyen.json",
    "selamlar": [
     "Birini bekliyorum.",
     "Selam."
    ],
    "selamlasma": "tokalas",
    "tepkiler": {
     "carpma": [
      "Dikkat et!",
      "Hey, önüne bak!"
     ],
     "itilme": [
      "Ne yapıyorsun?!",
      "Bana dokunma!"
     ],
     "vurulma": [
      "Ah!",
      "Delirdin mi?!"
     ]
    },
    "program": [
     {
      "saat": 8,
      "is": "bekle",
      "yer": [
       -2,
       -62
      ],
      "aci": 90
     },
     {
      "saat": 13,
      "is": "dolas",
      "yer": [
       6,
       -40
      ],
      "yaricap": 4
     },
     {
      "saat": 19,
      "is": "otur",
      "yer": [
       -12,
       -88
      ]
     }
    ]
   },
   {
    "id": "gezgin_1",
    "ad": "Gezgin",
    "gorunum": {
     "tur": "mh",
     "cinsiyet": "kadin",
     "yas_yil": 47,
     "boy_cm": 162,
     "kilo_kg": 63,
     "ten": "asian",
     "sac": "toigo_blunt_bob",
     "sac_rengi": "#2a1d15",
     "takim": "female_elegantsuit01",
     "ayakkabi": "mindfront_shoes_oxford_female",
     "goz": "brownlight",
     "kirpik": "eyelashes02",
     "gozluk": "kwnet_at_optical_glasses",
     "ayarlar": {
      "bel": -0.2,
      "cene_genislik": -0.3
     }
    },
    "alan": {
     "merkez": [
      12,
      -35
     ],
     "yaricap": 9
    },
    "hiz": 1.33,
    "diyalog": "",
    "selamlar": [
     "İyi yolculuklar.",
     "Hava ne güzel."
    ],
    "selamlasma": "yok",
    "tepkiler": {
     "carpma": [
      "Dikkat et!",
      "Hey, önüne bak!"
     ],
     "itilme": [
      "Ne yapıyorsun?!",
      "Bana dokunma!"
     ],
     "vurulma": [
      "Ah!",
      "Delirdin mi?!"
     ]
    }
   },
   {
    "id": "gezgin_2",
    "ad": "Gezgin",
    "gorunum": {
     "tur": "mh",
     "cinsiyet": "erkek",
     "yas_yil": 68,
     "boy_cm": 172,
     "kilo_kg": 88,
     "ten": "african",
     "sac": "short01",
     "sac_rengi": "#b8b8b8",
     "sakal": "grinsegold_full_beard",
     "sakal_rengi": "#b8b8b8",
     "takim": "male_worksuit01",
     "ayakkabi": "shoes03",
     "goz": "brown",
     "sapka": "jujube_newsboy_cap",
     "ayarlar": {
      "kas": -0.2
     }
    },
    "alan": {
     "merkez": [
      -13,
      -90
     ],
     "yaricap": 9
    },
    "hiz": 1.14,
    "diyalog": "",
    "selamlar": [
     "Biraz dinleniyorum.",
     "Merhaba."
    ],
    "davranis": "otur",
    "selamlasma": "yok",
    "tepkiler": {
     "carpma": [
      "Dikkat et!",
      "Hey, önüne bak!"
     ],
     "itilme": [
      "Ne yapıyorsun?!",
      "Bana dokunma!"
     ],
     "vurulma": [
      "Ah!",
      "Delirdin mi?!"
     ]
    }
   }
  ],
  "esyalar": [
   {
    "id": "defter",
    "ad": "Eski bir defter",
    "konum": [
     4.6,
     0,
     -12
    ],
    "aci": 0,
    "renk": "#7a4b26",
    "eldeki_konum": [
     0,
     0,
     0
    ],
    "eldeki_aci": [
     0,
     0,
     0
    ],
    "mesaj": "ÖRNEK: Sayfaları sararmış, içinde birkaç not var.",
    "puanlar": {}
   },
   {
    "id": "cicek",
    "ad": "Bir dal çiçek",
    "konum": [
     -4.6,
     0,
     -30
    ],
    "aci": 0,
    "renk": "#d65a8c",
    "mesaj": "ÖRNEK: Güzel kokuyor.",
    "puanlar": {}
   }
  ],
  "kapilar": [
   {
    "id": "kapi_1",
    "z": -42,
    "soru": "Önünde üç kapı var. Hangisinden geçeceksin?",
    "not": "ÖRNEK: puanlar yer tutucudur.",
    "secenekler": [
     {
      "id": "kirmizi",
      "etiket": "Kırmızı kapı",
      "renk": "#c0392b",
      "puanlar": {
       "ornek_c": 2
      },
      "odul": "Kırmızı rozet",
      "mesaj": "Cesur bir seçim."
     },
     {
      "id": "mavi",
      "etiket": "Mavi kapı",
      "renk": "#2e6fb7",
      "puanlar": {
       "ornek_b": 2
      },
      "odul": "",
      "mesaj": "Sakin bir yoldan devam ediyorsun."
     },
     {
      "id": "yesil",
      "etiket": "Yeşil kapı",
      "renk": "#2f9e5b",
      "puanlar": {
       "ornek_a": 2
      },
      "odul": "Bir avuç tohum",
      "mesaj": "Yeşilliklerin arasından geçiyorsun."
     }
    ]
   },
   {
    "id": "kapi_2",
    "z": -84,
    "soru": "İki kapı: biri aralık, biri kilitli görünüyor.",
    "not": "ÖRNEK: puanlar yer tutucudur.",
    "secenekler": [
     {
      "id": "aralik",
      "etiket": "Aralık kapı",
      "renk": "#d8c9a3",
      "puanlar": {
       "ornek_a": 1
      },
      "odul": "",
      "mesaj": "Kolay olanı seçtin."
     },
     {
      "id": "kilitli",
      "etiket": "Kilitli görünen kapı",
      "renk": "#6b4a2e",
      "puanlar": {
       "ornek_c": 1,
       "ornek_b": 1
      },
      "odul": "Eski bir anahtar",
      "mesaj": "Kapı aslında kilitli değilmiş!"
     }
    ]
   }
  ],
  "nesneler": [
   {
    "model": "varliklar/modeller/street_lamp_01/street_lamp_01.gltf",
    "konum": [
     -5.2,
     0,
     -6
    ],
    "aci": 90,
    "olcek": 1,
    "carpisma": {
     "yaricap": 0.15,
     "yukseklik": 3.8
    }
   },
   {
    "model": "varliklar/modeller/street_lamp_01/street_lamp_01.gltf",
    "konum": [
     5.2,
     0,
     -6
    ],
    "aci": -90,
    "olcek": 1,
    "carpisma": {
     "yaricap": 0.15,
     "yukseklik": 3.8
    }
   },
   {
    "model": "varliklar/modeller/street_lamp_01/street_lamp_01.gltf",
    "konum": [
     -5.2,
     0,
     -18
    ],
    "aci": 90,
    "olcek": 1,
    "carpisma": {
     "yaricap": 0.15,
     "yukseklik": 3.8
    }
   },
   {
    "model": "varliklar/modeller/street_lamp_01/street_lamp_01.gltf",
    "konum": [
     5.2,
     0,
     -18
    ],
    "aci": -90,
    "olcek": 1,
    "carpisma": {
     "yaricap": 0.15,
     "yukseklik": 3.8
    }
   },
   {
    "model": "varliklar/modeller/street_lamp_01/street_lamp_01.gltf",
    "konum": [
     -5.2,
     0,
     -30
    ],
    "aci": 90,
    "olcek": 1,
    "carpisma": {
     "yaricap": 0.15,
     "yukseklik": 3.8
    }
   },
   {
    "model": "varliklar/modeller/street_lamp_01/street_lamp_01.gltf",
    "konum": [
     5.2,
     0,
     -30
    ],
    "aci": -90,
    "olcek": 1,
    "carpisma": {
     "yaricap": 0.15,
     "yukseklik": 3.8
    }
   }
  ],
  "serpme": [
   {
    "model": "varliklar/modeller/grass_medium_01/grass_medium_01.gltf",
    "sayi": 6000,
    "olcek": [
     0.9,
     1.6
    ],
    "yoldan_uzaklik": 0.6,
    "genislik": 64
   }
  ],
  "kapi_gorunumu": {
   "duvar": {
    "doku": "varliklar/dokular/castle_brick_07",
    "olcek": 0.5
   },
   "kapi": {
    "doku": "varliklar/dokular/oak_wood_planks",
    "olcek": 0.8
   }
  },
  "kalabalik": {
   "not": "Otomatik üretilen MetaHuman'lar (BP_Uretilen_...) yolda dolaşır; yoksa kimse eklenmez.",
   "sayi": 6,
   "klasor": "/Game/MetaHumans",
   "onek": "BP_Uretilen",
   "ad": "Yoldan geçen",
   "yaricap": 10,
   "selamlar": [
    "Merhaba.",
    "İyi günler.",
    "Selam!"
   ],
   "diyalog": "diyaloglar/yoldan_gecen.json"
  },
  "sandiklar": [
   {
    "id": "sandik_1",
    "ad": "Eski sandık",
    "konum": [
     5.4,
     0,
     -50
    ],
    "aci": 90,
    "icerik": {
     "ad": "Gümüş pusula",
     "aciklama": "ÖRNEK eşya: eski, işlemeli bir pusula. Hep aynı yönü gösteriyor.",
     "puanlar": {},
     "mesaj": ""
    }
   }
  ],
  "gorevler": [
   {
    "id": "ornek_yolculuk",
    "ad": "Yolculuk (ÖRNEK)",
    "aciklama": "Sistemi denemek için örnek görev. Gerçek görevler Harun'dan gelecek.",
    "adimlar": [
     {
      "metin": "Yolcu ile konuş",
      "tur": "diyalog",
      "hedef": "yolcu"
     },
     {
      "metin": "Eski defteri bul",
      "tur": "esya",
      "hedef": "defter"
     },
     {
      "metin": "Eski sandığı aç",
      "tur": "sandik",
      "hedef": "sandik_1"
     },
     {
      "metin": "Bir kapı seç",
      "tur": "kapi",
      "hedef": ""
     },
     {
      "metin": "Yolun sonuna ulaş",
      "tur": "bitis",
      "hedef": ""
     }
    ]
   }
  ],
  "sesler": {
   "not": "ÖRNEK sesler: adımlar kodla üretildi (varliklar/sesler); kuşlar Unreal Starter Content'ten.",
   "adim_cim": "/Game/sesler/adim_cim",
   "adim_yol": "/Game/sesler/adim_yol",
   "ruzgar": "/Game/sesler/ruzgar",
   "kuslar": "/Game/StarterContent/Audio/Starter_Birds01",
   "ruzgar_siddeti": 0.35,
   "kus_siddeti": 0.45,
   "darbe": "/Game/sesler/darbe"
  }
 },
 "diyaloglar/yolcu.json": {
  "surum": 1,
  "id": "yolcu",
  "not": "ÖRNEK konuşma: metinler ve puanlar yer tutucudur.",
  "baslangic": "selam",
  "dugumler": {
   "selam": {
    "metin": "Merhaba! Bu yolda pek kimseyle karşılaşmam. Nereye gidiyorsun?",
    "secenekler": [
     {
      "metin": "Bilmiyorum, yolun beni nereye götüreceğini merak ediyorum.",
      "puanlar": {
       "ornek_c": 1
      },
      "sonraki": "merak"
     },
     {
      "metin": "Yolun sonuna. Bir planım var.",
      "puanlar": {
       "ornek_b": 1
      },
      "sonraki": "plan"
     },
     {
      "metin": "(Selam verip yürümeye devam et)",
      "puanlar": {
       "ornek_a": 1
      },
      "sonraki": ""
     }
    ]
   },
   "merak": {
    "metin": "Güzel bir cevap. Al, şu feneri yanına al; ileride işine yarayabilir.",
    "secenekler": [
     {
      "metin": "Teşekkür ederim!",
      "puanlar": {},
      "sonraki": "",
      "odul": "Fener"
     }
    ]
   },
   "plan": {
    "metin": "Plan iyidir. İleride kapılarla karşılaşacaksın; dikkatli seç.",
    "secenekler": [
     {
      "metin": "Tamam, sağ ol.",
      "puanlar": {},
      "sonraki": ""
     }
    ]
   }
  }
 },
 "diyaloglar/bekleyen.json": {
  "surum": 1,
  "id": "bekleyen",
  "not": "ÖRNEK konuşma: metinler ve puanlar yer tutucudur.",
  "baslangic": "bas",
  "dugumler": {
   "bas": {
    "metin": "Arkadaşımı bekliyorum ama geç kaldı. Sence beklemeli miyim, yoksa gitmeli miyim?",
    "secenekler": [
     {
      "metin": "Biraz daha bekle, bir sebebi vardır.",
      "puanlar": {
       "ornek_a": 1
      },
      "sonraki": ""
     },
     {
      "metin": "Ona bir mesaj atıp sor.",
      "puanlar": {
       "ornek_b": 1
      },
      "sonraki": ""
     },
     {
      "metin": "Git, zamanına değer ver.",
      "puanlar": {
       "ornek_c": 1
      },
      "sonraki": ""
     }
    ]
   }
  }
 },
 "diyaloglar/yoldan_gecen.json": {
  "surum": 1,
  "id": "yoldan_gecen",
  "not": "ÖRNEK konuşma: yolda dolaşan kişiler için kısa sohbet. Metinler yer tutucudur.",
  "baslangic": "selam",
  "dugumler": {
   "selam": {
    "metin": "Merhaba. Bir şey mi soracaktın?",
    "secenekler": [
     {
      "metin": "Yolun sonunda ne var?",
      "puanlar": {},
      "sonraki": "son"
     },
     {
      "metin": "Sadece selam vermek istedim.",
      "puanlar": {},
      "sonraki": "selam_ver"
     },
     {
      "metin": "(Bir şey söylemeden yürü)",
      "puanlar": {},
      "sonraki": ""
     }
    ]
   },
   "son": {
    "metin": "Bilmiyorum, ben de hiç sonuna kadar gitmedim. Anlatırsın belki.",
    "secenekler": [
     {
      "metin": "Tamam, görüşürüz.",
      "puanlar": {},
      "sonraki": ""
     }
    ]
   },
   "selam_ver": {
    "metin": "Selam! İyi yolculuklar.",
    "secenekler": [
     {
      "metin": "Sana da.",
      "puanlar": {},
      "sonraki": ""
     }
    ]
   }
  }
 }
};
