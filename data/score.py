import csv

f = open('winners.csv', 'rt')
reader = csv.reader(f)
full_data = []

current_year = 2016
for i in reader:
    full_data.append(i)

year_data = []
teams = []

for i in full_data:
    if int(i[1]) == current_year:
        year_data.append(i)
        teams.append(i[2])

teams = list(set(teams))
k = teams.copy()

res = {'match': 0}

for i in teams:
    res[i] = 0
    res[i + "_comments"] = None

t = []
t.append(res.copy())

for i in year_data:
    if i[4] != "":
        res[i[4]] = res[i[4]] + 2
        res[i[2]+'_comments'] = i[2] + " Vs " + i[3] + "<br>" + i[4] + " Wins"
        res[i[3]+'_comments'] = i[2] + " Vs " + i[3] + "<br>" + i[4] + " Wins"
    else:
        res[i[2]] = res[i[2]] + 1
        res[i[3]] = res[i[3]] + 1
        res[i[2]+'_comments'] = i[2] + " Vs " + i[3] + "<br>" + i[4] + " Wins"
        res[i[3]+'_comments'] = i[2] + " Vs " + i[3] + "<br>" + i[4] + " Wins"

    if all(res[j+"_comments"] != None for j in teams):
        res['match'] = res['match'] + 1
        t.append(res.copy())
        for j in teams:
            res[j + "_comments"] = None


keys = t[0].keys()

with open(str(current_year) + '.csv', 'w') as output_file:
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(t)
