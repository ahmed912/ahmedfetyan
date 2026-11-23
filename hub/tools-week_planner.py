# Adds the "Week planner" tab to a Persona bank workbook. Usage: python3 tools-week_planner.py in.xlsx out.xlsx
import sys
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
src,out=sys.argv[1],sys.argv[2]
wb=load_workbook(src)
if "Week planner" in wb.sheetnames: del wb["Week planner"]
ws=wb.create_sheet("Week planner",1); ws.sheet_properties.tabColor="2C2C2C"
F=lambda c:PatternFill("solid",fgColor=c)
th=Side(style="thin",color="BDBDBD"); BOX=Border(left=th,right=th,top=th,bottom=th)
WR=Alignment(wrap_text=True,vertical="top")
EX=Font(italic=True,color="8A8A8A")
widths={"A":16,"B":20,"C":26,"D":30,"E":16,"F":16,"G":16,"H":22,"I":20,"J":14}
for k,v in widths.items(): ws.column_dimensions[k].width=v
DAY={"Sun":("A3195B","FBE4EF","My Story","Who is this person?","Connect","Likability","none","Sun 08:30"),
     "Mon":("1E5BB8","E3EDFB","The Work","What did I do?","Prove","Authority","soft question","Mon 08:30"),
     "Tue":("B5530C","FFEBD9","The Lesson","What should you learn from it?","Educate","Relevance","soft question","Tue 08:30"),
     "Wed":("1E7B34","E3F5E7","Working with me","How would I do this for you?","Sell","Trust","Book a call","Wed 15:30"),
     "Thu":("6B3FA0","EFE7FA","The Change","Show me the change (carousel)","Educate","Authority","follow for next Thursday","Thu 08:30"),
     "Arabic":("0F766E","DDF3F0","My Thinking (Arabic)","My personal take on the theme","Connect","Likability","none","any day 08:30")}
ORDER=["Sun","Mon","Tue","Wed","Thu","Arabic"]
r=1
def title(text,color,sub=None):
    global r
    ws.cell(r,1,text).font=Font(bold=True,size=16,color="FFFFFF")
    for c in range(1,11): ws.cell(r,c).fill=F(color)
    ws.row_dimensions[r].height=30; r+=1
    if sub:
        ws.cell(r,1,sub).font=Font(italic=True,color="404B50"); ws.merge_cells(start_row=r,start_column=1,end_row=r,end_column=10); r+=1
def field(label,example,height=36):
    global r
    ws.cell(r,1,label).font=Font(bold=True); ws.cell(r,1).alignment=WR
    c=ws.cell(r,2,example); c.font=EX; c.alignment=WR
    ws.merge_cells(start_row=r,start_column=2,end_row=r,end_column=10)
    for cc in range(2,11): ws.cell(r,cc).border=BOX
    ws.row_dimensions[r].height=height; r+=1
def header(cols,color):
    global r
    for i,h in enumerate(cols,1):
        c=ws.cell(r,i,h); c.fill=F(color); c.font=Font(bold=True,color="FFFFFF"); c.alignment=Alignment(wrap_text=True,vertical="center")
    ws.row_dimensions[r].height=32; r+=1
def dv(ref,vals):
    d=DataValidation(type="list",formula1='"'+",".join(vals)+'"',allow_blank=True); d.showErrorMessage=False; ws.add_data_validation(d); d.add(ref)

ws.cell(r,1,"WEEK PLANNER").font=Font(bold=True,size=22,color="111111"); r+=1
ws.cell(r,1,"Fill top to bottom, about 45 minutes. Grey text is an example: type over it. Each week: right-click this tab > Duplicate, rename it with the date, then clear your answers.").font=Font(italic=True,color="404B50"); ws.merge_cells(start_row=r,start_column=1,end_row=r,end_column=10); r+=1
ws.cell(r,1,"Week of").font=Font(bold=True); ws.cell(r,2,"e.g. 29 Nov 2026").font=EX; ws.cell(r,2).border=BOX; r+=2

title("STEP 1  THE SOURCE","2C2C2C","Where this week's ideas come from: a finished project, or the top-scored line in your persona tabs.")
field("The client was","e.g. a sports agency preparing a pitch")
field("What they gave me had this problem","e.g. a text document, numbers marked 00, one paragraph called 'Why sport'")
field("The one change I made","e.g. I put the numbers on football shirts, because sports fans don't read charts")
field("Result or reaction (true only)","e.g. the client sent a thank-you message after delivery")
field("What I can show","e.g. fake text version of slides 1 to 7")
r+=1
title("STEP 1  THE THEME","2C2C2C","The one idea the whole week is about. Finish the sentence.")
field("Most people think","e.g. a pitch needs charts and paragraphs")
field("But actually","e.g. the audience remembers what they already love")
field("Theme of my week","e.g. Speak in what your audience already loves")
ws.cell(r,1,"Who is it for").font=Font(bold=True); ws.cell(r,2,"Founders").border=BOX
dv(f"B{r}",["Founders","Executives and teams","Speakers","Creative directors"]); r+=2

title("STEP 2  THE WEEK MAP","2C2C2C","One project, five questions. Defaults are filled in; change any of them.")
header(["Day","Pillar","The question it answers","Which piece of the project or theme","Goal","Builds","Funnel layer","Image","CTA","Time"],"404B50")
map_rows={}
for d in ORDER:
    fg,bg,pil,q,goal,builds,cta,time=DAY[d]
    vals=[d,pil,q,"",goal,builds,None,"",cta,time]
    for i,v in enumerate(vals,1):
        c=ws.cell(r,i,v); c.border=BOX; c.alignment=WR
    ws.cell(r,7,f'=IF(F{r}="","",IF(OR(F{r}="Relevance",F{r}="Likability"),"TOFU",IF(F{r}="Authority","MOFU","BOFU")))').fill=F("F2F2F2")
    ws.cell(r,1).fill=F(fg); ws.cell(r,1).font=Font(bold=True,color="FFFFFF"); ws.cell(r,2).fill=F(bg); ws.cell(r,2).font=Font(bold=True,color=fg)
    ws.cell(r,4,"e.g. the football shirts" if d=="Thu" else "").font=EX
    map_rows[d]=r; ws.row_dimensions[r].height=40; r+=1
first,last=map_rows["Sun"],map_rows["Arabic"]
dv(f"E{first}:E{last}",["Educate","Prove","Connect","Sell","Spark"]); dv(f"F{first}:F{last}",["Relevance","Authority","Trust","Likability","Action"])
dv(f"H{first}:H{last}",["Real slide","Branded card","Personal photo","No image","Carousel"])
r+=1
title("STEP 3  HOOKS","B5530C","Write 5 first lines per post, then copy the best one into 'Chosen hook'. A number, a moment, a myth or a fear. Never start with I.")
header(["Day","Hook 1","Hook 2","Hook 3","Hook 4","Hook 5","","Chosen hook","",""],"B5530C")
hook_rows={}
for d in ORDER:
    ws.cell(r,1,d).font=Font(bold=True,color="FFFFFF"); ws.cell(r,1).fill=F(DAY[d][0])
    for c in range(2,7): ws.cell(r,c).border=BOX; ws.cell(r,c).alignment=WR
    ws.merge_cells(start_row=r,start_column=8,end_row=r,end_column=10); ws.cell(r,8).border=BOX; ws.cell(r,8).alignment=WR; ws.cell(r,8).fill=F("FFF4CC")
    if d=="Thu": ws.cell(r,2,"e.g. Sports fans don't read charts.").font=EX
    hook_rows[d]=r; ws.row_dimensions[r].height=48; r+=1
r+=1
title("STEP 4  THE POSTS","1E5BB8","The skeleton: hook, proof, one guide line, ending, one CTA. Then the full draft. 120 to 200 words.")
header(["Day","Hook","Proof (real slide, before and after, or result)","One guide line (empathy OR one authority fact)","Ending (the lesson or the stakes)","","CTA","Full draft","",""],"1E5BB8")
post_rows={}
for d in ORDER:
    ws.cell(r,1,d).font=Font(bold=True,color="FFFFFF"); ws.cell(r,1).fill=F(DAY[d][0])
    ws.cell(r,2,f'=IF(H{hook_rows[d]}="","",H{hook_rows[d]})').fill=F("F2F2F2")
    ws.merge_cells(start_row=r,start_column=5,end_row=r,end_column=6)
    ws.cell(r,7,f'=I{map_rows[d]}').fill=F("F2F2F2")
    ws.merge_cells(start_row=r,start_column=8,end_row=r,end_column=10)
    for c in range(2,11): ws.cell(r,c).border=BOX; ws.cell(r,c).alignment=WR
    post_rows[d]=r; ws.row_dimensions[r].height=150; r+=1
r+=1
title("THURSDAY CAROUSEL (8 slides)","6B3FA0")
header(["Slide","Role","What goes on it","","","","","","",""],"6B3FA0")
for i,role in enumerate(["Hook","The problem","BEFORE","Fix 1","Fix 2","Fix 3","AFTER","CTA: follow for next Thursday"],1):
    ws.cell(r,1,i); ws.cell(r,2,role).font=Font(bold=True)
    ws.merge_cells(start_row=r,start_column=3,end_row=r,end_column=10)
    for c in range(1,11): ws.cell(r,c).border=BOX
    ws.cell(r,3).alignment=WR; ws.row_dimensions[r].height=32; r+=1
r+=1
title("STEP 5  CHECK BEFORE POSTING","B42318","Pick Yes or No. 'Ready' turns green when every check is Yes.")
header(["Day","First 3 lines work alone?","No 'I' at the start?","Proof or authority marker?","Edge test: my view, my proof, my signature?","One CTA only?","Read aloud?","Ready?","Scheduled in LinkedIn?","Logged in Content metrics?"],"B42318")
cfirst=r
for d in ORDER:
    ws.cell(r,1,d).font=Font(bold=True,color="FFFFFF"); ws.cell(r,1).fill=F(DAY[d][0])
    for c in range(2,8): ws.cell(r,c).border=BOX; ws.cell(r,c).alignment=Alignment(horizontal="center")
    ws.cell(r,8,f'=IF(COUNTIF(B{r}:G{r},"Yes")=6,"Ready",IF(COUNTA(B{r}:G{r})=0,"","Fix"))').fill=F("F2F2F2")
    for c in (9,10): ws.cell(r,c).border=BOX; ws.cell(r,c).alignment=Alignment(horizontal="center")
    r+=1
dv(f"B{cfirst}:G{r-1}",["Yes","No"]); dv(f"I{cfirst}:J{r-1}",["Yes","No"])
ws.conditional_formatting.add(f"H{cfirst}:H{r-1}",FormulaRule(formula=[f'H{cfirst}="Ready"'],fill=F("D7F0DC"),font=Font(bold=True,color="1E5B2E")))
ws.conditional_formatting.add(f"H{cfirst}:H{r-1}",FormulaRule(formula=[f'H{cfirst}="Fix"'],fill=F("FBDDDA"),font=Font(bold=True,color="8A1C12")))
ws.conditional_formatting.add(f"B{cfirst}:G{r-1}",FormulaRule(formula=[f'B{cfirst}="No"'],fill=F("FBDDDA")))
ws.conditional_formatting.add(f"B{cfirst}:G{r-1}",FormulaRule(formula=[f'B{cfirst}="Yes"'],fill=F("D7F0DC")))
r+=1
title("THURSDAY REVIEW","1E7B34","20 minutes, after logging the week in Content metrics.")
field("Best post this week and why","e.g. Thu carousel: 14 saves, 3 founders commented")
field("Saves, founder engagers, DMs, calls","e.g. 22 saves, 6 founders, 2 DMs, 1 call")
field("Weakest Builds this month","e.g. Trust (see the Builds balance tab)")
field("The ONE change for next week","e.g. post the Wed post at 15:30 sharp")
field("Next week's theme idea","e.g. an objection: 'What if I pay and hate it?'")
r+=1
title("CHEAT SHEET","555555")
for a,b in [("Persona","who you talk to"),("Theme","the one idea of the week: 'Most people think ___, but actually ___'"),("Pillar","the type of post; each has its day"),("Goal","what the post does: Educate, Prove, Connect, Sell, Spark"),("Builds","what they think about you: Relevance, Authority, Trust, Likability, Action"),("Hook","the first line that stops the scroll"),("CTA","the one action you ask for"),("The 5 moves","1 start with the hero's moment, not 'I designed' · 2 say what it was not before what it was · 3 give the turn its own line · 4 proof only from true facts · 5 cut every sentence that explains the design")]:
    ws.cell(r,1,a).font=Font(bold=True); ws.cell(r,2,b); ws.merge_cells(start_row=r,start_column=2,end_row=r,end_column=10); ws.cell(r,2).alignment=WR; ws.row_dimensions[r].height=30 if a!="The 5 moves" else 44; r+=1
ws.freeze_panes="A4"
wb.save(out); print("rows",r)
