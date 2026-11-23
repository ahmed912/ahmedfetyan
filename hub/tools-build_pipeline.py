import sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.chart import BarChart, Reference
out=sys.argv[1]
F=lambda c:PatternFill("solid",fgColor=c); B=lambda **k:Font(name="Inter",**k)
WH=Font(color="FFFFFF",bold=True,size=11,name="Inter"); BOR=Border(bottom=Side(style="thin",color="D0D0D0"))
STAGES=["1 SEE","2 TRUST","3 TALK","4 SHAPE","5 WIN","6 RETURN","Nurture","Lost"]
SC={"1 SEE":("B5530C","FFEBD9"),"2 TRUST":("1E5BB8","E3EDFB"),"3 TALK":("0F766E","DDF3F0"),"4 SHAPE":("6B3FA0","EFE7FA"),"5 WIN":("1E7B34","E3F5E7"),"6 RETURN":("2C2C2C","EDEDED"),"Nurture":("9A6B00","FFF4CC"),"Lost":("B42318","FDE7E5")}
SOURCES=["LinkedIn post","LinkedIn comment","Outbound DM","Slide Diagnosis","Upwork","Referral","Agency"]
PERS=["Founders","Executives and teams","Speakers","Creative directors","Other"]
DECKS=["Pitch deck","Company profile","C-level deck","Report","Keynote","Webinar","Other"]
SIGNALS=["Engaged 2 posts","Raising a round","New role","Event or keynote","Posted a deck","Agency pitch","Inbound ask","Other"]
YN=["Yes","No","?"]
LOST=["Price","Timing","In-house","Went with someone else","No reply","Not a fit","Other"]
wb=Workbook()
h=wb.active; h.title="How to use"
rows=[("Sales pipeline: The Clear Yes funnel",""),
("Stages","1 SEE, 2 TRUST, 3 TALK (DM or call booked), 4 SHAPE (call done, proposal), 5 WIN (deposit paid), 6 RETURN (delivered: testimonial, permission, referral). Nurture = not now. Lost = closed."),
("Daily","Add every new conversation as a row. Set Next action and its date. Red rows = overdue, yellow = due today."),
("Diagnosis call","After the call, fill the 4 green lights (Deadline, Decision maker, Budget, Materials). 4 = proposal. 2 to 3 = proposal with the gap or a smaller step. 0 to 1 = Nurture or refer."),
("Proposal","Enter the date sent; follow-up days 2, 5 and 10 calculate themselves. After day 10 with no answer: Nurture."),
("After the project","Tick Testimonial, Permission and Referral asked. Each project becomes a Work that won post."),
("Thursday","Read the Dashboard with the Content metrics sheet. Which stage leaks most? Change ONE thing."),
("Privacy","Use first names or initials if you prefer. This sheet stays in your Drive.")]
for i,(a,b) in enumerate(rows,1): h.cell(i,1,a); h.cell(i,2,b)
h["A1"].font=B(bold=True,size=20,color="FFFFFF"); h["A1"].fill=F("2C2C2C"); h.merge_cells("A1:B1"); h.row_dimensions[1].height=42
for i in range(2,len(rows)+1):
    h.cell(i,1).font=B(bold=True,color="0F766E",size=12); h.cell(i,2).font=B(size=11)
    for c in (1,2): h.cell(i,c).alignment=Alignment(wrap_text=True,vertical="center")
    h.row_dimensions[i].height=44
h.column_dimensions["A"].width=22; h.column_dimensions["B"].width=110; h.sheet_properties.tabColor="2C2C2C"

L=wb.create_sheet("Leads")
cols=[("Name or initials",16,1),("Company",18,1),("Persona",16,1),("Source",15,1),("Signal",16,1),("First touch",11,1),("Stage",11,1),("Next action",28,1),("Next action date",11,1),
("Deck type",14,1),("Room date (deadline)",11,1),("Deadline real?",8,1),("Decision maker?",8,1),("Budget fits?",8,1),("Materials exist?",8,1),("Green lights",8,0),
("Proposal value",11,1),("Proposal sent",11,1),("Follow up day 2",11,0),("Follow up day 5",11,0),("Close the loop day 10",11,0),
("Outcome / won value",11,1),("Lost reason",14,1),("Post that helped",22,1),("Testimonial asked?",9,1),("Permission to show?",9,1),("Referral asked?",9,1),("Notes",30,1)]
for i,(n,w,inp) in enumerate(cols,1):
    c=L.cell(1,i,n); c.fill=F("0F766E") if inp else F("555555"); c.font=WH; c.alignment=Alignment(wrap_text=True,vertical="center",horizontal="center")
    L.column_dimensions[c.column_letter].width=w
L.row_dimensions[1].height=46
N=300
for r in range(2,N+2):
    L[f"P{r}"]=f'=IF(A{r}="","",COUNTIF(L{r}:O{r},"Yes"))'
    L[f"S{r}"]=f'=IF(R{r}="","",R{r}+2)'; L[f"T{r}"]=f'=IF(R{r}="","",R{r}+5)'; L[f"U{r}"]=f'=IF(R{r}="","",R{r}+10)'
    for col in "FIKRSTU": L[f"{col}{r}"].number_format="yyyy-mm-dd"
    for col in "QV": L[f"{col}{r}"].number_format="#,##0"
    for col in "PSTU": L[f"{col}{r}"].fill=F("F2F2F2")
    for i in range(1,len(cols)+1): L.cell(r,i).border=BOR
def dv(col,vals):
    d=DataValidation(type="list",formula1='"'+",".join(vals)+'"',allow_blank=True); d.showErrorMessage=False; L.add_data_validation(d); d.add(f"{col}2:{col}{N+1}")
for col,v in [("C",PERS),("D",SOURCES),("E",SIGNALS),("G",STAGES),("J",DECKS),("L",YN),("M",YN),("N",YN),("O",YN),("W",LOST),("Y",YN),("Z",YN),("AA",YN)]: dv(col,v)
for s,(fg,bg) in SC.items():
    L.conditional_formatting.add(f"G2:G{N+1}",FormulaRule(formula=[f'$G2="{s}"'],fill=F(bg),font=Font(bold=True,color=fg)))
L.conditional_formatting.add(f"A2:I{N+1}",FormulaRule(formula=[f'AND($I2<>"",$I2<TODAY(),$G2<>"Lost",$G2<>"6 RETURN")'],fill=F("FBDDDA"),font=Font(bold=True,color="8A1C12")))
L.conditional_formatting.add(f"A2:I{N+1}",FormulaRule(formula=[f'AND($I2<>"",$I2=TODAY())'],fill=F("FFF4CC"),font=Font(bold=True,color="7A4C00")))
for col in "STU":
    L.conditional_formatting.add(f"{col}2:{col}{N+1}",FormulaRule(formula=[f'AND({col}2<>"",{col}2<=TODAY(),$G2="4 SHAPE")'],fill=F("FBDDDA"),font=Font(bold=True,color="8A1C12")))
L.conditional_formatting.add(f"P2:P{N+1}",FormulaRule(formula=['AND(P2<>"",P2=4)'],fill=F("D7F0DC"),font=Font(bold=True,color="1E5B2E")))
L.conditional_formatting.add(f"P2:P{N+1}",FormulaRule(formula=['AND(P2<>"",P2<=1)'],fill=F("FBDDDA"),font=Font(bold=True,color="8A1C12")))
L.freeze_panes="B2"; L.auto_filter.ref=f"A1:AB{N+1}"; L.sheet_properties.tabColor="0F766E"

D=wb.create_sheet("Dashboard",1); D.sheet_properties.tabColor="1E7B34"
D["A1"]="Pipeline dashboard"; D["A1"].font=B(bold=True,size=20,color="FFFFFF"); D["A1"].fill=F("2C2C2C"); D.merge_cells("A1:F1"); D.row_dimensions[1].height=40
D["A2"]="Read on Thursday with the Content metrics sheet. Find the stage that leaks most. Change ONE thing."; D["A2"].font=B(italic=True,color="404B50")
LR="Leads!"
hdr=["Stage","Now in stage","Reached this stage or later","Conversion from previous stage"]
for i,x in enumerate(hdr,1):
    c=D.cell(4,i,x); c.fill=F("2C2C2C"); c.font=WH; c.alignment=Alignment(wrap_text=True,horizontal="center")
D.row_dimensions[4].height=32
main=STAGES[:6]
for j,s in enumerate(STAGES):
    r=5+j; fg,bg=SC[s]
    D.cell(r,1,s).font=Font(bold=True,color=fg)
    for c in range(1,5): D.cell(r,c).fill=F(bg); D.cell(r,c).border=BOR
    D.cell(r,2,f'=COUNTIF({LR}$G:$G,$A{r})')
    if s in main:
        later=main[j:]
        D.cell(r,3,"="+"+".join(f'COUNTIF({LR}$G:$G,"{x}")' for x in later))
        if j>0:
            D.cell(r,4,f'=IFERROR(C{r}/C{r-1},"")'); D.cell(r,4).number_format="0%"
rr=15
heads=[("Leads total",f'=COUNTA({LR}A2:A1000)',"0"),("Calls done (stage 4+)",f'=C8',"0"),("Proposals sent",f'=COUNT({LR}R2:R1000)',"0"),("Won (stage 5+)",f'=C9',"0"),
("Close rate (won / proposals)",f'=IFERROR(C9/COUNT({LR}R2:R1000),"")',"0%"),("Open pipeline value",f'=SUMIFS({LR}Q:Q,{LR}G:G,"4 SHAPE")',"#,##0"),("Won value",f'=SUM({LR}V:V)',"#,##0"),("Overdue next actions",f'=COUNTIFS({LR}I:I,"<"&TODAY(),{LR}G:G,"<>Lost",{LR}G:G,"<>6 RETURN")',"0")]
for i,(n,f,fmt) in enumerate(heads):
    c1=D.cell(rr,1+i,n); c1.fill=F("EDEDED"); c1.font=B(bold=True,size=10,color="404B50"); c1.alignment=Alignment(wrap_text=True,horizontal="center")
    c2=D.cell(rr+1,1+i,f); c2.font=B(bold=True,size=20); c2.alignment=Alignment(horizontal="center"); c2.number_format=fmt
D.row_dimensions[rr].height=32; D.row_dimensions[rr+1].height=36
D.conditional_formatting.add(f"H{rr+1}",FormulaRule(formula=[f"H{rr+1}>0"],fill=F("FBDDDA"),font=Font(bold=True,color="8A1C12",size=20)))
sr=rr+4
for i,x in enumerate(["Source","Leads","Calls done (4+)","Won (5+)","Won value"],1):
    c=D.cell(sr,i,x); c.fill=F("0F766E"); c.font=WH; c.alignment=Alignment(horizontal="center",wrap_text=True)
for j,s in enumerate(SOURCES):
    r=sr+1+j; D.cell(r,1,s).font=B(bold=True)
    D.cell(r,2,f'=COUNTIF({LR}$D:$D,$A{r})')
    D.cell(r,3,f'=COUNTIFS({LR}$D:$D,$A{r},{LR}$G:$G,"4 SHAPE")+COUNTIFS({LR}$D:$D,$A{r},{LR}$G:$G,"5 WIN")+COUNTIFS({LR}$D:$D,$A{r},{LR}$G:$G,"6 RETURN")')
    D.cell(r,4,f'=COUNTIFS({LR}$D:$D,$A{r},{LR}$G:$G,"5 WIN")+COUNTIFS({LR}$D:$D,$A{r},{LR}$G:$G,"6 RETURN")')
    D.cell(r,5,f'=SUMIFS({LR}$V:$V,{LR}$D:$D,$A{r})'); D.cell(r,5).number_format="#,##0"
    for c in range(1,6): D.cell(r,c).border=BOR
lr=sr+len(SOURCES)+3
for i,x in enumerate(["Lost reason","Count"],1):
    c=D.cell(lr,i,x); c.fill=F("B42318"); c.font=WH
for j,s in enumerate(LOST):
    r=lr+1+j; D.cell(r,1,s); D.cell(r,2,f'=COUNTIF({LR}$W:$W,$A{r})')
for col,w in zip("ABCDEFGH",[22,13,16,16,14,16,14,14]): D.column_dimensions[col].width=w
ch=BarChart(); ch.type="bar"; ch.title="Funnel: reached stage or later"; ch.height=8; ch.width=16
ch.add_data(Reference(D,min_col=3,min_row=4,max_row=10),titles_from_data=True); ch.set_categories(Reference(D,min_col=1,min_row=5,max_row=10))
ch.y_axis.scaling.orientation="minMax"; ch.x_axis.scaling.orientation="maxMin"
D.add_chart(ch,"J4")
wb.move_sheet("Leads",offset=0)
wb.save(out); print("ok")
