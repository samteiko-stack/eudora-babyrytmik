import { Registration } from '@/types';
import { getWeekNumber, formatDate, getMonday } from '@/lib/dates';
import { parse } from 'date-fns';
import { addWeeks } from 'date-fns';

const csvData = `Time of Registration,First Name,Last Name,Email,Phone,Week Number,Which Preschool?,Status
11/20/2025 11:32am,,,,,,,Registered
11/20/2025 11:38am,,,,,,,Registered
1/15/2026 8:29am,,,,,Vecka 1,,Registered
1/15/2026 8:29am,,,,,Vecka 2,,Registered
1/15/2026 8:29am,,,,,Vecka 3,,Registered
1/15/2026 8:31am,Mary,Carlsson,maryreid.carlsson@gmail.com,(073) 733-7919,Vecka 4,Eudora Södermalm,Registered
1/22/2026 6:59am,,,,,Vecka 4,,Registered
1/15/2026 8:29am,,,,,Vecka 5,,Registered
1/21/2026 8:21pm,Eskil,Gustafsson,alissagustafsson@gmail.com,(070) 758-3754,Vecka 5,Eudora Södermalm,Registered
1/22/2026 9:03pm,Linda,Beigart,linda.beigart@yahoo.com,(072) 712-1165,Vecka 5,Eudora Gärdet,Registered
1/25/2026 8:52am,Daan,Botes,rozaan1980@gmail.com,(070) 027-0454,Vecka 5,Eudora Södermalm,Registered
1/29/2026 9:49am,Alfred,Stephanie Elis mamma och Pappa,,,Vecka 5,,Registered
1/29/2026 9:49am,Linnea ,Cicilia Eskils mamma,,,Vecka 5,,Registered
1/29/2026 9:49am,Theodor,Benjamins Pappa,,,Vecka 5,,Registered
1/29/2026 9:49am,Ebba,,,,Vecka 5,,Registered
1/15/2026 8:29am,,,,,Vecka 6,,Registered
1/15/2026 8:29am,,,,,Vecka 7,,Registered
2/2/2026 6:58pm,Daan,Botes,rozaan1980@gmail.com,(070) 027-0454,Vecka 7,Eudora Södermalm,Registered
2/5/2026 7:18am,Peter,Burgman,burgman.peter@gmail.com,(070) 290-6194,Vecka 7,Eudora Södermalm,Registered
2/5/2026 8:44am,Stephanie,Rodriguez,sdrodriguez1@gmail.com,(073) 101-0523,Vecka 7,Eudora Södermalm,Registered
2/8/2026 9:01pm,Marta,Roczniewska,kwiecien.marta@gmail.com,(079) 309-7784,Vecka 7,Eudora Södermalm,Registered
2/8/2026 9:01pm,Marta,Roczniewska,kwiecien.marta@gmail.com,(079) 309-7784,Vecka 7,Eudora Södermalm,Registered
1/15/2026 8:29am,,,,,Vecka 8,,Registered
2/9/2026 1:42am,Tove,Winiger Gessau,tove@winiger.se,703064767,Vecka 8,Eudora Södermalm,Registered
2/15/2026 10:51pm,Tadeusz ,Roczniewska,kwiecien.marta@gmail.com,793097784,Vecka 8,Eudora Södermalm,Registered
1/15/2026 8:29am,,,,,Vecka 9,,Registered
2/22/2026 2:56pm,Tadeusz ,Roczniewski,kwiecien.marta@gmail.com,793097784,Vecka 9,Eudora Södermalm,Registered
1/15/2026 8:29am,,,,,Vecka 10,,Registered
2/27/2026 1:40am,Manuela,Gotskozik Bjelke,manuelabjelke@gmail.com,(070) 742-2448,Vecka 10,Eudora Södermalm,Registered
1/15/2026 8:29am,,,,,Vecka 11,,Registered
1/15/2026 8:29am,,,,,Vecka 12,,Registered
1/15/2026 8:29am,,,,,Vecka 13,,Registered
1/15/2026 8:29am,,,,,Vecka 14,,Registered
1/15/2026 8:29am,,,,,Vecka 15,,Registered
1/15/2026 8:29am,,,,,Vecka 16,,Registered
1/15/2026 8:29am,,,,,Vecka 17,,Registered
1/15/2026 8:29am,,,,,Vecka 18,,Registered
1/15/2026 8:29am,,,,,Vecka 19,,Registered
1/15/2026 8:29am,,,,,Vecka 20,,Registered
1/15/2026 8:29am,,,,,Vecka 21,,Registered
1/15/2026 8:29am,,,,,Vecka 22,,Registered
1/15/2026 8:29am,,,,,Vecka 23,,Registered
1/15/2026 8:29am,,,,,Vecka 24,,Registered
1/15/2026 8:29am,,,,,Vecka 25,,Registered
1/15/2026 8:29am,,,,,Vecka 26,,Registered
1/15/2026 8:29am,,,,,Vecka 27,,Registered
8/27/2025 9:31am,Ashur,Adam,ashur.adam@gmail.com,(073) 903-4512,Vecka 36,Eudora Södermalm,Registered
8/27/2025 3:17pm,Daan,Botes,rozaan1980@gmail.com,(070) 027-0454,Vecka 36,Eudora Södermalm,Registered
8/27/2025 6:38pm,Ashton,Gilbert,karlabothma444@gmail.com,(076) 608-5069,Vecka 36,Eudora Södermalm,Registered
9/11/2025 6:56am,Stephanie,,,,Vecka 36,Eudora Södermalm,Registered
9/11/2025 6:57am,Sharon,,,,Vecka 36,Eudora Södermalm,Registered
8/27/2025 6:31pm,Daan,Botes,rozaan1980@gmail.com,(070) 027-0454,Vecka 37,Eudora Södermalm,Registered
9/9/2025 11:56am,Karla,Gilbert ,karlabothma444@gmail.com,(076) 608-5069,Vecka 38,Eudora Södermalm,Registered
9/14/2025 11:56am,Daan,Botes,rozaan1980@gmail.com,(070) 027-0454,Vecka 38,Eudora Södermalm,Registered
9/24/2025 12:40pm,Sharon / Theodore,,,,Vecka 38,Eudora Södermalm,Registered
9/25/2025 9:38am,Stefanine,,,,Vecka 38,Eudora Södermalm,Registered
10/2/2025 12:21pm,Rozaan,,,,Vecka 39,Eudora Södermalm,Registered
10/2/2025 12:33pm,Karla,,,,Vecka 39,Eudora Södermalm,Registered
10/2/2025 12:33pm,Sharon,,,,Vecka 39,Eudora Södermalm,Registered
9/22/2025 1:05pm,Daan,Botes,rozaan1980@gmail.com,(070) 027-0454,Vecka 40,Eudora Södermalm,Registered
9/22/2025 7:19pm,Samantha ,Mullins,samantie7@gmail.com,(073) 506-5354,Vecka 40,Eudora Södermalm,Registered
9/22/2025 7:21pm,Natalie,Burgman,natjaneclarke@gmail.com,(070) 298-1103,Vecka 40,Eudora Södermalm,Registered
9/22/2025 7:22pm,Issy,Gill,issyrgill@gmail.com,(072) 922-8685,Vecka 40,Eudora Södermalm,Registered
9/22/2025 7:23pm,Georgie ,Rush,georgina.rush@dnb.se,(072) 373-2400,Vecka 40,Eudora Södermalm,Registered
9/22/2025 7:24pm,Natalie,Burgman,natjaneclarke@gmail.com,(070) 298-1103,Vecka 40,Eudora Södermalm,Registered
9/22/2025 8:21pm,Hannah,Garrity,hannahgarrity7@gmail.com,(070) 043-9055,Vecka 40,Eudora Södermalm,Registered
9/22/2025 9:04pm,Marta,Roczniewska,marta.roczniewska@gmail.com,793097784,Vecka 40,Eudora Södermalm,Registered
9/23/2025 11:00am,Eviana ,Kennmar-Arnold,abigaillarnold@gmail.com,(072) 446-6942,Vecka 40,Eudora Södermalm,Registered
9/24/2025 5:17pm,Ophelia ,Scott ,allenjackscott@gmail.com,(076) 241-2251,Vecka 40,Eudora Södermalm,Registered
10/2/2025 12:28pm,Sharon/Theodor,,,,Vecka 40,Eudora Södermalm,Registered
10/2/2025 12:29pm,Karla,Gilbert,,,Vecka 40,Eudora Södermalm,Registered
10/2/2025 12:38pm,Fatemeh,,,,Vecka 40,Eudora Södermalm,Registered
9/22/2025 7:45pm,Natalie,Burgman ,natjaneclarke@gmail.com,(070) 298-1103,Vecka 41,Eudora Södermalm,Registered
10/2/2025 9:35am,Tadeusz,Roczniewski,kwiecien.marta@gmail.com,(079) 309-7784,Vecka 41,Eudora Södermalm,Registered
10/2/2025 10:43am,Rory,Gill,issyrgill@gmail.com,(072) 922-8685,Vecka 41,Eudora Södermalm,Registered
10/2/2025 10:43am,Rory,Gill,issyrgill@gmail.com,(072) 922-8685,Vecka 41,Eudora Södermalm,Registered
10/2/2025 3:20pm,Ophelia,Scott,allenjackscott@gmail.com,(076) 241-2251,Vecka 41,Eudora Södermalm,Registered
9/30/2025 5:53pm,Marta,Roczniewska,kwiecien.marta@gmail.com,(079) 309-7784,Vecka 42,Eudora Södermalm,Registered
10/2/2025 12:59pm,Emma,Hedberg Rundgren,emmahedbergrundgren@gmail.com,(072) 234-1644,Vecka 42,Eudora Södermalm,Registered
10/2/2025 12:59pm,Emma,Hedberg Rundgren,emmahedbergrundgren@gmail.com,(072) 234-1644,Vecka 42,Eudora Södermalm,Registered
10/7/2025 8:18am,Ashur,Adam,ashur.adam@gmail.com,(073) 903-4512,Vecka 42,Eudora Södermalm,Registered
10/16/2025 9:27am,,Theodor,,,Vecka 42,Eudora Södermalm,Registered
10/16/2025 9:27am,,Ofelia,,,Vecka 42,Eudora Södermalm,Registered
10/16/2025 9:27am,Rozaan,Daniel,,,Vecka 42,Eudora Södermalm,Registered
10/16/2025 9:27am,Karla,Aston,,,Vecka 42,Eudora Södermalm,Registered
10/16/2025 9:28am,,Hosein,,,Vecka 42,Eudora Södermalm,Registered
10/16/2025 9:29am,,,,,Vecka 42,Eudora Södermalm,Registered
10/15/2025 1:14pm,Natalie,Burgman,natjaneclarke@gmail.com,(070) 298-1103,Vecka 44,Eudora Södermalm,Registered
10/15/2025 1:25pm,Natalie,Burgman,natjaneclarke@gmail.com,(070) 298-1103,Vecka 44,Eudora Södermalm,Registered
10/16/2025 7:31pm,Tadeusz,Roczniewski,kwiecien.marta@gmail.com,(079) 309-7784,Vecka 44,Eudora Södermalm,Registered
11/5/2025 4:59pm,Theodor,,,,Vecka 44,Eudora Södermalm,Registered
10/15/2025 1:25pm,Natalie,Burgman,natjaneclarke@gmail.com,(070) 298-1103,Vecka 45,Eudora Södermalm,Registered
10/15/2025 1:25pm,Natalie,Burgman,natjaneclarke@gmail.com,(070) 298-1103,Vecka 45,Eudora Södermalm,Registered
10/31/2025 7:15pm,Daan,Botes,rozaan1980@gmail.com,(070) 027-0454,Vecka 45,Eudora Södermalm,Registered
11/6/2025 2:56pm,Tadzio,Roczniewski,kwiecien.marta@gmail.com,793097784,Vecka 46,Eudora Södermalm,Registered
11/6/2025 2:56pm,Tadzio,Roczniewski,kwiecien.marta@gmail.com,793097784,Vecka 46,Eudora Södermalm,Registered
11/9/2025 8:37pm,Daan,Botes,rozaan1980@gmail.com,(070) 027-0454,Vecka 46,Eudora Södermalm,Registered
11/19/2025 9:56am,,,,,Vecka 46,,Registered
11/19/2025 9:56am,,,,,Vecka 46,,Registered
11/20/2025 8:04am,,,,,Vecka 46,,Registered
11/20/2025 8:19am,Housaain,,,,Vecka 47,,Registered
11/17/2025 6:45pm,Natalie,Burgman ,natjaneclarke@gmail.com,(070) 298-1103,Vecka 48,,Registered
11/17/2025 6:45pm,Natalie,Burgman ,natjaneclarke@gmail.com,(070) 298-1103,Vecka 48,,Registered
11/19/2025 9:33pm,Theodor,Lim Simic,toni.simic242@gmail.com,(073) 525-7730,Vecka 48,Eudora Södermalm,Registered
12/1/2025 10:22am,Rozaan,,,,Vecka 48,,Registered
12/1/2025 10:23am,Karla,,,,Vecka 48,,Registered
12/1/2025 10:23am,Olivia,,,,Vecka 48,,Registered
12/1/2025 10:23am,,,,,Vecka 48,,Registered
1/15/2026 8:02am,,,,,Vecka 48,,Registered
11/17/2025 8:00am,Mary,Carlsson,maryreid.carlsson@gmail.com,(073) 033-7919,Vecka 49,Eudora Gärdet,Registered`;

function parseCSV(csv: string): Registration[] {
  const lines = csv.trim().split('\n');
  const registrations: Registration[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');
    
    const timeStr = parts[0];
    const firstName = parts[1] || 'Anonym';
    const lastName = parts[2] || '';
    const email = parts[3] || 'ingen@email.se';
    const phone = parts[4] || '0000000000';
    const weekStr = parts[5]; // e.g., "Vecka 40"
    const locationStr = parts[6]; // e.g., "Eudora Södermalm"
    
    // Skip rows with missing critical data
    if (!timeStr || !weekStr) continue;
    
    // Parse the registration time
    const createdAt = parse(timeStr, 'M/d/yyyy h:mma', new Date());
    
    // Extract week number
    const weekMatch = weekStr.match(/Vecka (\d+)/);
    if (!weekMatch) continue;
    const weekNumber = parseInt(weekMatch[1]);
    
    // Determine the year from the registration date
    const year = createdAt.getFullYear();
    
    // Calculate the Monday of that week in the correct year
    const firstDayOfYear = new Date(year, 0, 1);
    const firstMonday = getMonday(firstDayOfYear);
    const targetWeekMonday = addWeeks(firstMonday, weekNumber - 1);
    const weekStart = formatDate(targetWeekMonday);
    
    // Parse location
    let location: 'sodermalm' | 'gardet' = 'sodermalm';
    if (locationStr && locationStr.includes('Gärdet')) {
      location = 'gardet';
    }
    
    registrations.push({
      id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      firstName,
      lastName,
      email,
      phone,
      location,
      weekStart,
      createdAt: createdAt.toISOString(),
      status: 'confirmed',
    });
  }
  
  return registrations;
}

const registrations = parseCSV(csvData);
console.log(JSON.stringify(registrations, null, 2));
