import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule, ColorScaleRule, DataBarRule
from openpyxl.chart import LineChart, BarChart, Reference
out=sys.argv[1]
F=lambda c:PatternFill("solid",fgColor=c)
HEAD=F("2C2C2C"); WH=Font(color="FFFFFF",bold=True,size=11,name="Inter")
B=lambda **k:Font(name="Inter",**k)
thin=Side(style="thin",color="D0D0D0"); BOR=Border(bottom=thin)
WR=Alignment(wrap_text=True,vertical="center")
PILLARS=["The Work","The Change","The Lesson","Working with me","My Story","My Thinking (Arabic)"]
PERS=["Founders","Executives and teams","Speakers","Creative directors","New persona"]
GOALS=["Educate","Prove","Connect","Sell","Spark"]
BUILDS=["Relevance","Authority","Trust","Likability","Action"]
BCOL={"Relevance":("B5530C","FFEBD9"),"Authority":("1E5BB8","E3EDFB"),"Trust":("1E7B34","E3F5E7"),"Likability":("A3195B","FBE4EF"),"Action":("2C2C2C","EDEDED")}
PCOL={"The Work":"E3EDFB","The Change":"FFEBD9","The Lesson":"FFF4CC","Working with me":"E3F5E7","My Story":"EFE7FA","My Thinking (Arabic)":"DDF3F0"}
FORMATS=["Text only","Text + real slide","Text + branded card","Text + personal photo","Carousel","Video"]
DOORS=["Myth-buster","Mistake","Behind the scenes","The Change","Question answered","Story","Number","Teardown","Framework"]
DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
wb=Workbook()

# How to use
h=wb.active; h.title="How to use"
lines=[("Content metrics: free tracker",None),
("What it does","Logs every post, then shows what works by pillar, format, Builds, persona and day, plus what LinkedIn free never shows: founders who engaged, DMs, calls and posts used in sales."),
("When","Every Thursday review (20 min): log last week's posts. LinkedIn numbers settle after about 7 days, so log each post a week after it went out."),
("Where the numbers are (free)","On each post: 'View analytics' (impressions, members reached, reactions, comments, reposts, saves, sends, profile viewers and followers from this post). On your profile: Analytics shows profile views and followers. If you see an Export button there, you can copy numbers from the export instead of typing."),
("What you count yourself","Founder engagers: open reactions and comments, count founders, CEOs and decision makers. DMs from post, Used in sales (sent in a DM or proposal), Calls booked."),
("Step 1","Posts log: one row per post. Grey columns calculate themselves. Pick from the dropdowns, including Funnel layer (TOFU, MOFU, BOFU). Monthly mix target: 40% TOFU, 40% MOFU, 20% BOFU."),
("Step 2","Weekly: fill one row per week (comments you made, followers, profile views, DMs, calls, the ONE change)."),
("Step 3","Dashboard: read it at the Thursday review. Weakest Builds this month = plan it first on Sunday."),
("Judge by","Saves, founder engagers, DMs and calls. Not likes. Under 10 posts, every conclusion is early."),
("Colors","Blue headers = you type. Grey cells = formulas, don't type. Green = above your average, red = below.")]
for i,(a,b) in enumerate(lines,1):
    h.cell(i,1,a); h.cell(i,2,b)
h["A1"].font=B(bold=True,size=20,color="FFFFFF"); h["A1"].fill=HEAD; h.merge_cells("A1:B1"); h.row_dimensions[1].height=42
for i in range(2,len(lines)+1):
    h.cell(i,1).font=B(bold=True,color="1E5BB8",size=12); h.cell(i,2).font=B(size=11,color="111111")
    h.cell(i,1).alignment=WR; h.cell(i,2).alignment=WR; h.row_dimensions[i].height=48
h.column_dimensions["A"].width=26; h.column_dimensions["B"].width=110; h.sheet_properties.tabColor="2C2C2C"

# Lists
L=wb.create_sheet("Lists")
for c,(name,vals) in enumerate([("Pillar",PILLARS),("Persona",PERS),("Goal",GOALS),("Builds",BUILDS),("Format",FORMATS),("Door",DOORS),("Yes/No",["Yes","No"])],1):
    L.cell(1,c,name).font=B(bold=True)
    for r,v in enumerate(vals,2): L.cell(r,c,v)
L.sheet_state="visible"; L.sheet_properties.tabColor="999999"

# Posts log
P=wb.create_sheet("Posts log",1)
cols=[("Date",12,"in"),("Day",7,"f"),("Time (Egypt)",10,"in"),("Pillar",20,"in"),("Persona",18,"in"),("Goal",11,"in"),("Builds",12,"in"),("Format",19,"in"),("Door / hook type",17,"in"),("Reach post?",9,"in"),("Theme of the week",22,"in"),("Hook (first line)",36,"in"),("Link",22,"in"),
("Impressions",12,"in"),("Members reached",11,"in"),("Reactions",10,"in"),("Comments",10,"in"),("Reposts",9,"in"),("Saves",8,"in"),("Sends",8,"in"),("Profile viewers from post",11,"in"),("Followers from post",11,"in"),
("Founder engagers",11,"in"),("DMs from post",9,"in"),("Used in sales",9,"in"),("Calls booked",9,"in"),
("Engagement rate",11,"f"),("Save rate",9,"f"),("Founder share",10,"f"),("Value score",10,"f"),("Notes",30,"in"),("Funnel layer",12,"in")]
for i,(n,w,t) in enumerate(cols,1):
    c=P.cell(1,i,n); c.fill=F("1E5BB8") if t=="in" else F("555555"); c.font=WH; c.alignment=Alignment(wrap_text=True,vertical="center",horizontal="center")
    P.column_dimensions[c.column_letter].width=w
P.row_dimensions[1].height=46
N=400
for r in range(2,N+2):
    P[f"B{r}"]=f'=IF(A{r}="","",CHOOSE(WEEKDAY(A{r}),"Sun","Mon","Tue","Wed","Thu","Fri","Sat"))'
    P[f"AA{r}"]=f'=IF(OR(N{r}="",N{r}=0),"",(P{r}+Q{r}+R{r})/N{r})'
    P[f"AB{r}"]=f'=IF(OR(N{r}="",N{r}=0),"",S{r}/N{r})'
    P[f"AC{r}"]=f'=IF(OR(W{r}="",P{r}+Q{r}=0),"",W{r}/(P{r}+Q{r}))'
    # value score: weights what brings work, not likes
    P[f"AD{r}"]=f'=IF(A{r}="","",S{r}*2+T{r}*2+Q{r}*1+W{r}*3+X{r}*5+Y{r}*3+Z{r}*10+V{r}*1)'
    for col in ["B","AA","AB","AC","AD"]:
        P[f"{col}{r}"].fill=F("F2F2F2"); P[f"{col}{r}"].font=B(color="333333")
    P[f"A{r}"].number_format="yyyy-mm-dd"
    for col in ["AA","AB","AC"]: P[f"{col}{r}"].number_format="0.0%"
    for i in range(1,len(cols)+1): P.cell(r,i).border=BOR
for col,vals in [("D",PILLARS),("E",PERS),("F",GOALS),("G",BUILDS),("H",FORMATS),("I",DOORS),("J",["Yes","No"]),("AF",["TOFU","MOFU","BOFU","Post-funnel"])]:
    dv=DataValidation(type="list",formula1='"'+",".join(vals)+'"',allow_blank=True); dv.showErrorMessage=False
    P.add_data_validation(dv); dv.add(f"{col}2:{col}{N+1}")
dd=DataValidation(type="date",allow_blank=True); P.add_data_validation(dd); dd.add(f"A2:A{N+1}")
for b,(fg,bg) in BCOL.items():
    P.conditional_formatting.add(f"G2:G{N+1}",FormulaRule(formula=[f'$G2="{b}"'],fill=F(bg),font=Font(bold=True,color=fg)))
for p,bg in PCOL.items():
    P.conditional_formatting.add(f"D2:D{N+1}",FormulaRule(formula=[f'$D2="{p}"'],fill=F(bg),font=Font(bold=True,color="111111")))
for col in ["AA","AB","AC","AD"]:
    P.conditional_formatting.add(f"{col}2:{col}{N+1}",FormulaRule(formula=[f'AND({col}2<>"",{col}2>=AVERAGE(${col}$2:${col}${N+1}))'],fill=F("D7F0DC"),font=Font(bold=True,color="1E5B2E")))
    P.conditional_formatting.add(f"{col}2:{col}{N+1}",FormulaRule(formula=[f'AND({col}2<>"",{col}2<AVERAGE(${col}$2:${col}${N+1}))'],fill=F("FBDDDA"),font=Font(color="8A1C12")))
P.conditional_formatting.add(f"N2:N{N+1}",DataBarRule(start_type="min",end_type="max",color="5B8DEF"))
P.freeze_panes="C2"; P.auto_filter.ref=f"A1:AF{N+1}"
for lay,(fg,bg) in {"TOFU":("B5530C","FFEBD9"),"MOFU":("1E5BB8","E3EDFB"),"BOFU":("1E7B34","E3F5E7"),"Post-funnel":("2C2C2C","EDEDED")}.items():
    P.conditional_formatting.add(f"AF2:AF{N+1}",FormulaRule(formula=[f'$AF2="{lay}"'],fill=F(bg),font=Font(bold=True,color=fg))); P.sheet_properties.tabColor="1E5BB8"

# Weekly
W=wb.create_sheet("Weekly",2)
wcols=[("Week starts (Sun)",13,"in"),("Posts planned",9,"in"),("Posts published",10,"f"),("Consistency",11,"f"),("Impressions",12,"f"),("Saves",9,"f"),("Founder engagers",11,"f"),("Comments I made on founders' posts",14,"in"),("Followers (end of week)",12,"in"),("Profile views (last 7 days)",12,"in"),("DMs from founders",11,"in"),("Posts used in sales",11,"in"),("Calls booked",10,"in"),("Weakest Builds",13,"f"),("The ONE change for next week",40,"in")]
for i,(n,w,t) in enumerate(wcols,1):
    c=W.cell(1,i,n); c.fill=F("0F766E") if t=="in" else F("555555"); c.font=WH; c.alignment=Alignment(wrap_text=True,vertical="center",horizontal="center")
    W.column_dimensions[c.column_letter].width=w
W.row_dimensions[1].height=58
start=dt.date(2026,11,22)
R="'Posts log'!"
for k in range(52):
    r=k+2; W[f"A{r}"]=start+dt.timedelta(weeks=k); W[f"A{r}"].number_format="yyyy-mm-dd"
    W[f"B{r}"]=6
    rng=f'{R}$A:$A,">="&$A{r},{R}$A:$A,"<"&$A{r}+7'
    W[f"C{r}"]=f'=COUNTIFS({rng})'
    W[f"D{r}"]=f'=IF(B{r}=0,"",C{r}/B{r})'; W[f"D{r}"].number_format="0%"
    W[f"E{r}"]=f'=SUMIFS({R}$N:$N,{rng})'
    W[f"F{r}"]=f'=SUMIFS({R}$S:$S,{rng})'
    W[f"G{r}"]=f'=SUMIFS({R}$W:$W,{rng})'
    W[f"N{r}"]=f"=Dashboard!$B$34"
    for col in "CDEFGN": W[f"{col}{r}"].fill=F("F2F2F2")
    for i in range(1,16): W.cell(r,i).border=BOR
W.conditional_formatting.add("D2:D53",FormulaRule(formula=['AND(D2<>"",D2>=0.9)'],fill=F("D7F0DC"),font=Font(bold=True,color="1E5B2E")))
W.conditional_formatting.add("D2:D53",FormulaRule(formula=['AND(D2<>"",C2>0,D2<0.9)'],fill=F("FBDDDA"),font=Font(bold=True,color="8A1C12")))
W.conditional_formatting.add("H2:H53",FormulaRule(formula=['AND(H2<>"",H2<25)'],fill=F("FFF4CC")))
W.freeze_panes="B2"; W.sheet_properties.tabColor="0F766E"

# Dashboard
D=wb.create_sheet("Dashboard",1)
D.sheet_properties.tabColor="1E7B34"
D["A1"]="Dashboard: what works"; D["A1"].font=B(bold=True,size=20,color="FFFFFF"); D["A1"].fill=HEAD; D.merge_cells("A1:H1"); D.row_dimensions[1].height=40
D["A2"]="Read at the Thursday review. Green = best in the column. Judge by saves, founders, DMs and calls, not likes."; D["A2"].font=B(italic=True,color="404B50")
def table(top,title,dim_col,values,color):
    D.cell(top,1,title).font=B(bold=True,size=14,color=color)
    hdr=[title.split(" by ")[-1].capitalize(),"Posts","Avg impressions","Avg engagement","Avg save rate","Founder engagers","DMs + calls","Avg value score"]
    for i,hh in enumerate(hdr,1):
        c=D.cell(top+1,i,hh); c.fill=F(color); c.font=WH; c.alignment=Alignment(wrap_text=True,horizontal="center",vertical="center")
    D.row_dimensions[top+1].height=32
    for j,v in enumerate(values):
        r=top+2+j; D.cell(r,1,v).font=B(bold=True)
        col=f"{R}${dim_col}:${dim_col}"
        D.cell(r,2,f'=COUNTIFS({col},$A{r})')
        D.cell(r,3,f'=IFERROR(AVERAGEIFS({R}$N:$N,{col},$A{r}),"")')
        D.cell(r,4,f'=IFERROR(AVERAGEIFS({R}$AA:$AA,{col},$A{r}),"")')
        D.cell(r,5,f'=IFERROR(AVERAGEIFS({R}$AB:$AB,{col},$A{r}),"")')
        D.cell(r,6,f'=SUMIFS({R}$W:$W,{col},$A{r})')
        D.cell(r,7,f'=SUMIFS({R}$X:$X,{col},$A{r})+SUMIFS({R}$Z:$Z,{col},$A{r})')
        D.cell(r,8,f'=IFERROR(AVERAGEIFS({R}$AD:$AD,{col},$A{r}),"")')
        D.cell(r,3).number_format="#,##0"; D.cell(r,4).number_format="0.0%"; D.cell(r,5).number_format="0.00%"; D.cell(r,8).number_format="0.0"
        for i in range(1,9): D.cell(r,i).border=BOR
    end=top+1+len(values)
    for colL in "CDEFGH":
        D.conditional_formatting.add(f"{colL}{top+2}:{colL}{end}",ColorScaleRule(start_type="min",start_color="FFFFFF",end_type="max",end_color="8FD19E"))
    return end+2
# Headline numbers
D["A4"]="Headline (all time)"; D["A4"].font=B(bold=True,size=14,color="2C2C2C")
heads=[("Posts logged",f"=COUNT({R}A:A)","0"),("Total impressions",f"=SUM({R}N:N)","#,##0"),("Total saves",f"=SUM({R}S:S)","#,##0"),("Founder engagers",f"=SUM({R}W:W)","#,##0"),("DMs from posts",f"=SUM({R}X:X)","0"),("Posts used in sales",f"=SUM({R}Y:Y)","0"),("Calls booked",f"=SUM({R}Z:Z)","0"),("Avg consistency (weeks so far)",'=IFERROR(AVERAGEIFS(Weekly!D:D,Weekly!A:A,"<="&TODAY(),Weekly!C:C,">0"),"")',"0%")]
for i,(n,f,fmt) in enumerate(heads):
    c1=D.cell(5,1+i,n); c1.fill=F("EDEDED"); c1.font=B(bold=True,size=10,color="404B50"); c1.alignment=Alignment(wrap_text=True,horizontal="center")
    c2=D.cell(6,1+i,f); c2.font=B(bold=True,size=20,color="111111"); c2.alignment=Alignment(horizontal="center"); c2.number_format=fmt
D.row_dimensions[5].height=30; D.row_dimensions[6].height=36
# Builds balance this month at fixed place (row 28..34)
nxt=8
D.cell(nxt,1,"Builds balance this month").font=B(bold=True,size=14,color="1E7B34")
for i,hh in enumerate(["Builds","Target (of 20)","Posted this month","Gap","% of target"],1):
    c=D.cell(nxt+1,i,hh); c.fill=F("1E7B34"); c.font=WH; c.alignment=Alignment(horizontal="center")
tg={"Relevance":5,"Authority":6,"Trust":5,"Likability":3,"Action":2}
for j,b in enumerate(BUILDS):
    r=nxt+2+j; fg,bg=BCOL[b]
    D.cell(r,1,b).font=Font(bold=True,color=fg); 
    for i in range(1,5): D.cell(r,i).fill=F(bg)
    D.cell(r,2,tg[b]); D.cell(r,3,f'=COUNTIFS({R}$G:$G,$A{r},{R}$A:$A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))')
    D.cell(r,4,f"=B{r}-C{r}"); D.cell(r,5,f"=C{r}/B{r}"); D.cell(r,5).number_format="0%"; D.cell(r,5).fill=F(bg)
weak_row=nxt+8
D.cell(weak_row,1,"Weakest Builds now").font=B(bold=True)
D.cell(weak_row,2,f'=INDEX(A{nxt+2}:A{nxt+6},MATCH(MIN(E{nxt+2}:E{nxt+6}),E{nxt+2}:E{nxt+6},0))').font=B(bold=True,size=14,color="B42318")
nt=weak_row+3
nt=table(nt,"Results by pillar","D",PILLARS,"B5530C")
nt=table(nt,"Results by format","H",FORMATS,"6B3FA0")
nt=table(nt,"Results by builds","G",BUILDS,"1E7B34")
nt=table(nt,"Results by persona","E",PERS,"1E5BB8")
nt=table(nt,"Results by funnel layer","AF",["TOFU","MOFU","BOFU","Post-funnel"],"2C2C2C")
nt=table(nt,"Results by door","I",DOORS,"A3195B")
nt=table(nt,"Results by day","B",DAYS,"0F766E")
for col,w in zip("ABCDEFGH",[24,10,15,15,14,15,12,15]): D.column_dimensions[col].width=w
# fix Weekly reference to weakest
for k in range(52): W[f"N{k+2}"]=f"=Dashboard!$B${weak_row}"
# 12-week targets
tt=nt
D.cell(tt,1,"12-week targets").font=B(bold=True,size=14,color="2C2C2C")
for i,hh in enumerate(["Target","Goal","So far","Status"],1):
    c=D.cell(tt+1,i,hh); c.fill=HEAD; c.font=WH
targets=[("Posts published (90% of 60)",54,f"=COUNTIFS({R}A:A,\">=\"&DATE(2026,11,22),{R}A:A,\"<\"&DATE(2027,2,14))"),
("Carousels",12,f"=COUNTIFS({R}H:H,\"Carousel\",{R}A:A,\">=\"&DATE(2026,11,22))"),
("Posts used in sales",36,f"=SUMIFS({R}Y:Y,{R}A:A,\">=\"&DATE(2026,11,22))"),
("Comments on founders' posts",300,"=SUM(Weekly!H2:H13)"),
("Calls booked from LinkedIn","track","=SUM(Weekly!M2:M13)")]
for j,(n,g,f) in enumerate(targets):
    r=tt+2+j; D.cell(r,1,n); D.cell(r,2,g); D.cell(r,3,f)
    D.cell(r,4,f'=IF(ISNUMBER(B{r}),IF(C{r}>=B{r},"Done",TEXT(C{r}/B{r},"0%")),"")')
    for i in range(1,5): D.cell(r,i).border=BOR
D.conditional_formatting.add(f"D{tt+2}:D{tt+6}",FormulaRule(formula=[f'D{tt+2}="Done"'],fill=F("D7F0DC"),font=Font(bold=True,color="1E5B2E")))
# charts on Weekly data
ch=LineChart(); ch.title="Impressions per week"; ch.height=7; ch.width=16
ch.add_data(Reference(W,min_col=5,min_row=1,max_row=27),titles_from_data=True); ch.set_categories(Reference(W,min_col=1,min_row=2,max_row=27))
D.add_chart(ch,"J4")
ch2=LineChart(); ch2.title="Founder engagers and saves per week"; ch2.height=7; ch2.width=16
ch2.add_data(Reference(W,min_col=6,max_col=7,min_row=1,max_row=27),titles_from_data=True); ch2.set_categories(Reference(W,min_col=1,min_row=2,max_row=27))
D.add_chart(ch2,"J20")
pr=weak_row+3+2  # pillar table first data row
ch3=BarChart(); ch3.title="Avg value score by pillar"; ch3.height=7; ch3.width=16
ch3.add_data(Reference(D,min_col=8,min_row=pr-1,max_row=pr+5),titles_from_data=True); ch3.set_categories(Reference(D,min_col=1,min_row=pr,max_row=pr+5))
D.add_chart(ch3,"J36")
D.freeze_panes="A3"
wb.move_sheet("Lists", offset=10)
wb.save(out); print("ok", weak_row, nt)
