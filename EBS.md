# What is EBS (in simple terms)?
EBS (Elastic Block Store) is a disk for your EC2 server.
Think:
EC2 = computer/server
EBS = hard disk attached to it

It stores:
OS files
Application data
Logs
Databases
Uploads
Docker volumes
Anything that needs persistent storag


Reasons to add EBS
1. Root disk is small
Default EC2 disk is often 8–10 GB.
Apps quickly fill it.
So we add EBS:
Root disk → OS
Extra EBS → app data

2. Data persistence
If instance crashes:
Detach EBS → attach to new EC2 → data recovered
Critical for production.

3. Separate OS and data
Best practice:
/         → OS
/data     → application data
OS can be replaced without losing data.

4. High performance storage
EBS provides:
SSD
High IOPS
High throughput
Good for databases & heavy workloads.

5. Scaling storage easily
You can grow disk size without downtime:
100GB → 200GB → 500GB

6. Snapshots & backups
You can snapshot volumes:

EBS is ssd for ec2 

lsblk--->is a Linux command that shows all storage devices (disks and partitions) attached to your system.

blkid command — what is it used for?
blkid is a Linux command used to show information about storage devices, especially their filesystem type and UUID.

# lsblk → shows disks and partitions structure
# blkid → shows filesystem details of partitions

# What is /etc/fstab in Linux?
fstab stands for File System Table.
It is a configuration file in Linux that tells the system:
Which disks/partitions should be mounted automatically when the system boots.
The file is located at:
/etc/fstab


# Why is fstab needed?
When you attach a new disk (for example, an EBS volume in AWS), you can mount it manually:
sudo mount /dev/xvdb1 /data

But after reboot, the mount disappears.
So you add an entry in /etc/fstab to mount it automatically every boot.
fstab = list of disks Linux mounts automatically at startup.

# What is /etc/mtab in Linux?
mtab stands for Mounted File Systems Table.
It shows currently mounted filesystems on the system (both persistent and temporary).

# lsblk
It only shows devices already attached to your instance.

# note 
Attaching a disk and mounting a disk are two different steps.
# Step 1 — Attach (AWS level)
When you attach EBS to EC2:
AWS Console
    ↓
Volume connected to VM hardware

Linux now sees a disk:
lsblk

Example:
nvme1n1   100G disk
But you still can't use it for files.
It’s just a raw disk.

# Step 2 — Mount (Linux level)
Mounting tells Linux:
"Use this disk at this folder location."

# Restaurant Kitchen Example (better analogy)
Imagine an EC2 instance is a restaurant kitchen.

Step 1 — Disk attached
A truck delivers a sack of rice to the restaurant.
The sack is inside the restaurant building now.
But it is still in storage, not in cooking area.

This is:
EBS attached to instance
Disk exists but unused
Chef still can't cook with it easily.

# Step 2 — Disk mounted
Chef moves rice sack to cooking station.
Now cooks can use it.
This is:
Mount disk to /data
Now applications can use storage.


EBS = your working disk
Snapshot = backup copy of disk
Laptop storage = EBS
Google Drive backup = Snapshot

# snapshot
Copy of EBS volume stored in S3

Snapshot efficiency

Snapshots are incremental:

First snapshot = full copy
Next snapshot = only changed blocks

Typical production workflow
EC2 running
      ↓
Daily snapshots
      ↓
If crash happens
      ↓
Restore volume